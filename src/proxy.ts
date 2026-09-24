import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Routing-layer gate for /admin/*. This is defense-in-depth, not the only
 * check: every admin page also calls requireAdmin() itself, and the CSV
 * export route checks the session directly — Next's own docs warn that a
 * proxy matcher change could silently stop covering a route, so Server
 * Functions/Route Handlers must never rely on this alone.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
