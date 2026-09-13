"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setSkillActive, deleteSkill, moveSkillOrder } from "@/lib/adminActions";
import { Icon } from "@/components/ui/Icon";

export function SkillRowActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      await setSkillActive(id, !active);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Remove this skill? If staff have already assessed it, it will be deactivated instead of deleted.")) return;
    startTransition(async () => {
      await deleteSkill(id);
      router.refresh();
    });
  }

  function move(direction: "up" | "down") {
    startTransition(async () => {
      await moveSkillOrder(id, direction);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={() => move("up")} disabled={isPending} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)]" aria-label="Move up">
        <Icon name="chevron" className="h-3.5 w-3.5 -rotate-90" />
      </button>
      <button onClick={() => move("down")} disabled={isPending} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)]" aria-label="Move down">
        <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
      </button>
      <Link href={`/admin/skills/${id}`} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)]" aria-label="Edit skill">
        <Icon name="edit" className="h-3.5 w-3.5" />
      </Link>
      <button onClick={toggleActive} disabled={isPending} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)]" aria-label={active ? "Deactivate skill" : "Activate skill"}>
        <Icon name={active ? "lock" : "check"} className="h-3.5 w-3.5" />
      </button>
      <button onClick={remove} disabled={isPending} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)] text-[var(--color-danger)]" aria-label="Delete skill">
        <Icon name="delete" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
