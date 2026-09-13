import { requireAdmin } from "@/lib/session";
import { getStaffAccounts } from "@/lib/adminUsers";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { UserRowActions } from "@/components/admin/UserRowActions";
import { PLATFORM_SHORT_LABELS } from "@/lib/constants";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const { accounts, totalStaff, totalAdmins, onboardedCount, newThisWeek } = await getStaffAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Staff accounts</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Who has an account and where they are in onboarding. This shows account details only — individual
          capability self-assessments remain private (see the Overview page for aggregated trends).
        </p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{totalStaff}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Total accounts</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{onboardedCount}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Completed onboarding</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{totalAdmins}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Admins</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{newThisWeek}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">New this week</p>
          </CardBody>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--color-ink-faint)] border-b border-[var(--color-border)]">
              <th className="py-2.5 px-4 font-medium">Name</th>
              <th className="py-2.5 px-4 font-medium">Email</th>
              <th className="py-2.5 px-4 font-medium">Department</th>
              <th className="py-2.5 px-4 font-medium">Role</th>
              <th className="py-2.5 px-4 font-medium">Platform</th>
              <th className="py-2.5 px-4 font-medium">Signed up</th>
              <th className="py-2.5 px-4 font-medium">Onboarded</th>
              <th className="py-2.5 px-4 font-medium">Last login</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2.5 px-4 font-medium text-[var(--color-ink)]">
                  {a.name ?? "—"} {a.id === admin.id && <span className="text-xs text-[var(--color-ink-faint)]">(you)</span>}
                </td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{a.email}</td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{a.department ?? "—"}</td>
                <td className="py-2.5 px-4">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={
                      a.role === "ADMIN"
                        ? { background: "var(--color-brand-soft)", color: "var(--color-brand-text)" }
                        : { background: "var(--color-surface-sunken)", color: "var(--color-ink-muted)" }
                    }
                  >
                    {a.role === "ADMIN" ? "Admin" : "Staff"}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{PLATFORM_SHORT_LABELS[a.platformPreference]}</td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">{formatDate(a.createdAt)}</td>
                <td className="py-2.5 px-4">
                  {a.onboarded ? (
                    <span className="inline-flex items-center gap-1 text-[var(--color-success)]">
                      <Icon name="check" className="h-3.5 w-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="text-[var(--color-ink-faint)]">Not yet</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-[var(--color-ink-muted)]">
                  {a.lastLogin ? formatDateTime(a.lastLogin) : "Never"}
                </td>
                <td className="py-2.5 px-4">
                  <UserRowActions id={a.id} role={a.role} isSelf={a.id === admin.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
