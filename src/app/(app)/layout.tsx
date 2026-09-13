import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!session.user.onboarded) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <a
        href="#main-content"
        className="sr-only-focusable fixed top-2 left-2 z-50 rounded-lg bg-[var(--color-brand)] text-white px-4 py-2 text-sm font-medium"
      >
        Skip to main content
      </a>
      <Sidebar isAdmin={session.user.role === "ADMIN"} userName={session.user.name ?? session.user.email ?? "Account"} />
      <div className="flex-1 min-w-0">
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
