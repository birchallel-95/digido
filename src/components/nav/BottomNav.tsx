"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { STAFF_LINKS } from "@/components/nav/NavLinks";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-surface-raised)]/95 backdrop-blur border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex justify-around">
        {STAFF_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium min-h-[52px] justify-center",
                  active ? "text-[var(--color-brand-text)]" : "text-[var(--color-ink-faint)]"
                )}
              >
                <Icon name={link.icon} className="h-5 w-5" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
