"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { STAFF_LINKS_DESKTOP, ADMIN_LINK } from "@/components/nav/NavLinks";

export function Sidebar({ isAdmin, userName }: { isAdmin: boolean; userName: string }) {
  const pathname = usePathname();
  const links = isAdmin ? [...STAFF_LINKS_DESKTOP, ADMIN_LINK] : STAFF_LINKS_DESKTOP;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] h-screen sticky top-0">
      <div className="px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg text-[var(--color-ink)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand)] text-[var(--color-ink)]">
            <Icon name="compass" className="h-4.5 w-4.5" />
          </span>
          DigiDo
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1" aria-label="Main navigation">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-text)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
              )}
            >
              <Icon name={link.icon} className="h-4.5 w-4.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <div className="px-3 py-2 text-sm text-[var(--color-ink-muted)] truncate">{userName}</div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
        >
          <Icon name="logout" className="h-4.5 w-4.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
