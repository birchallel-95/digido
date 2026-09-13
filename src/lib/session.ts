import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Requires a signed-in user; redirects to /login otherwise. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

/** Requires a signed-in admin; redirects staff back to the dashboard. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
