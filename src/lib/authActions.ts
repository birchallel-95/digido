"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export interface RegisterResult {
  ok: boolean;
  error?: string;
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  department?: string;
}): Promise<RegisterResult> {
  const email = params.email.trim().toLowerCase();
  if (!email || !params.password || params.password.length < 8) {
    return { ok: false, error: "Please provide a name, valid email, and a password of at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists. Try signing in instead." };
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  await prisma.user.create({
    data: {
      name: params.name.trim(),
      email,
      passwordHash,
      department: params.department?.trim() || null,
      role: "STAFF",
    },
  });

  return { ok: true };
}

export async function credentialsSignIn(params: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: params.email,
      password: params.password,
      redirect: false,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "Incorrect email or password." };
    }
    throw err;
  }
}
