import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getAdminDashboardData, getReflectionsDetail } from "@/lib/adminDashboard";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { RagBreakdownSection } from "@/components/admin/RagBreakdownSection";
import { AdminUsersRagTable } from "@/components/admin/AdminUsersRagTable";
import { ReflectionsPanel } from "@/components/admin/ReflectionsPanel";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getAdminDashboardData();
  const reflections = data.showReflections ? await getReflectionsDetail() : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Admin Dashboard</h1>
          <p className="text-[var(--color-ink-muted)] mt-1">
            Registered users, sign-ups over time, and how capability statements have been rated —{" "}
            <Link href="/admin/users" className="text-[var(--color-brand-text)] hover:underline">
              manage roles and accounts →
            </Link>
          </p>
        </div>
        <a href="/api/admin/export-users">
          <Button variant="outline">
            <Icon name="download" className="h-4 w-4" /> Export to CSV
          </Button>
        </a>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{data.totalUsers}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Registered users</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{data.totalStatementsRated}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Capability statements rated</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">
              {data.totalStatementsRated > 0 ? Math.round((data.ragTotals.green / data.totalStatementsRated) * 100) : 0}%
            </p>
            <p className="text-xs text-[var(--color-ink-faint)]">Rated green (mastered)</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{data.totalReflections}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Reflections written</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Sign-ups over time</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">Cumulative registered accounts, day by day.</p>
          <SignupsChart points={data.signups} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <RagBreakdownSection title="By Jisc element" rows={data.byArea} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <RagBreakdownSection title="By tier" rows={data.byLevel} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Registered users</h2>
          <AdminUsersRagTable users={data.users} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-display font-bold text-[var(--color-ink)]">Reflections</h2>
            <span className="text-xs text-[var(--color-ink-faint)]">
              {data.showReflections ? "Visible to admins — turned on in Settings" : "Hidden by default"}
            </span>
          </div>
          <ReflectionsPanel reflections={reflections} showReflections={data.showReflections} />
        </CardBody>
      </Card>
    </div>
  );
}
