"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserRole, removeStaffAccount } from "@/lib/adminActions";
import { Icon } from "@/components/ui/Icon";
import type { Role } from "@/lib/constants";

export function UserRowActions({ id, role, isSelf }: { id: string; role: Role; isSelf: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleRole() {
    const next: Role = role === "ADMIN" ? "STAFF" : "ADMIN";
    if (!confirm(`${next === "ADMIN" ? "Make" : "Remove"} this person ${next === "ADMIN" ? "an admin" : "as admin"}?`)) return;
    startTransition(async () => {
      const result = await setUserRole(id, next);
      if (!result.ok && result.error) alert(result.error);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Remove this account? This deletes their profile, progress and evidence permanently and cannot be undone.")) return;
    startTransition(async () => {
      const result = await removeStaffAccount(id);
      if (!result.ok && result.error) alert(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={toggleRole}
        disabled={isPending}
        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)]"
        aria-label={role === "ADMIN" ? "Remove admin access" : "Make admin"}
        title={role === "ADMIN" ? "Remove admin access" : "Make admin"}
      >
        <Icon name="shield" className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={remove}
        disabled={isPending || isSelf}
        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)] text-[var(--color-danger)] disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Remove account"
        title={isSelf ? "You can't remove your own account" : "Remove account"}
      >
        <Icon name="delete" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
