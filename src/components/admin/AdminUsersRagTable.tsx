import { RAG_COLORS, RagLegend } from "@/components/admin/RagBar";
import type { AdminUserRow } from "@/lib/adminDashboard";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function RagHeader({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 justify-end">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export function AdminUsersRagTable({ users }: { users: AdminUserRow[] }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Every registered user, how many capability statements they&apos;ve rated, and their RAG split.
        </p>
        <RagLegend />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-ink-faint)] border-b border-[var(--color-border)]">
              <th className="py-2.5 px-4 font-medium">Name</th>
              <th className="py-2.5 px-4 font-medium">Email</th>
              <th className="py-2.5 px-4 font-medium">Signed up</th>
              <th className="py-2.5 px-4 font-medium">Last login</th>
              <th className="py-2.5 px-4 font-medium text-right">Rated</th>
              <th className="py-2.5 px-4 font-medium text-right">
                <RagHeader color={RAG_COLORS.red} label="Red" />
              </th>
              <th className="py-2.5 px-4 font-medium text-right">
                <RagHeader color={RAG_COLORS.amber} label="Amber" />
              </th>
              <th className="py-2.5 px-4 font-medium text-right">
                <RagHeader color={RAG_COLORS.green} label="Green" />
              </th>
              <th className="py-2.5 px-4 font-medium text-right">Reflections</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2.5 px-4 font-medium text-[var(--color-ink)]">{u.name ?? "—"}</td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{u.email}</td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{formatDate(u.createdAt)}</td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{u.lastLogin ? formatDateTime(u.lastLogin) : "Never"}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-[var(--color-ink)] tabular-nums">{u.totalRated}</td>
                <td className="py-2.5 px-4 text-right text-[var(--color-ink-muted)] tabular-nums">{u.red}</td>
                <td className="py-2.5 px-4 text-right text-[var(--color-ink-muted)] tabular-nums">{u.amber}</td>
                <td className="py-2.5 px-4 text-right text-[var(--color-ink-muted)] tabular-nums">{u.green}</td>
                <td className="py-2.5 px-4 text-right text-[var(--color-ink-muted)] tabular-nums">{u.reflectionsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
