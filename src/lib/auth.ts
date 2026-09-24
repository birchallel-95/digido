import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT sessions let Credentials (email/password) and OAuth (Google) coexist
  // cleanly — the Prisma adapter still persists Users/Accounts for OAuth.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

        return { id: user.id, name: user.name, email: user.email, role: user.role as Role, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = ((user as { role?: Role }).role ?? "STAFF") as Role;
        token.uid = user.id;
        token.checkedAt = Date.now();
      }

      // Re-sync role/onboarding from the DB on first sign-in, right after
      // onboarding completes, and periodically thereafter — the periodic
      // check is what catches an account that's been removed (by an admin,
      // or a dev database reset) while its session is still active, so a
      // deleted user gets signed out gracefully instead of every subsequent
      // action failing with a raw foreign-key error against a user that no
      // longer exists.
      const REVALIDATE_INTERVAL_MS = 5 * 60 * 1000;
      const staleCheck = typeof token.checkedAt !== "number" || Date.now() - token.checkedAt > REVALIDATE_INTERVAL_MS;
      console.log("[jwt-debug]", { trigger, hasUser: Boolean(user), tokenEmail: token.email, tokenOnboardedBefore: token.onboarded, staleCheck });
      if ((token.onboarded === undefined || trigger === "update" || staleCheck) && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        console.log("[jwt-debug] refetched", { found: Boolean(dbUser), dbOnboarded: dbUser?.onboarded });
        if (!dbUser) return null; // account no longer exists — invalidate the session
        token.role = dbUser.role as Role;
        token.uid = dbUser.id;
        token.onboarded = dbUser.onboarded;
        token.checkedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as Role) ?? "STAFF";
        session.user.onboarded = Boolean(token.onboarded);
      }
      return session;
    },
  },
});
