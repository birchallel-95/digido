import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getAdminDashboardData, getReflectionsDetail } from "@/lib/adminDashboard";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TimeSeriesChart } from "@/components/admin/TimeSeriesChart";
import { RagBreakdownSection } from "@/components/admin/RagBreakdownSection";
import { AdminUsersRagTable } from "@/components/admin/AdminUsersRagTable";
import { ReflectionsPanel } from "@/components/admin/ReflectionsPanel";
import { getVideoAdminStats } from "@/lib/videoAdmin";
import { getCheckpointStats } from "@/lib/checkpointAdmin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [data, videoStats, checkpointStats] = await Promise.all([
    getAdminDashboardData(),
    getVideoAdminStats(),
    getCheckpointStats(),
  ]);
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
          <TimeSeriesChart points={data.signups} emptyLabel="No sign-ups yet." chartTitle="Total sign-ups over time" countLabel="New sign-ups" />
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

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Video Tips</h2>
        <Link href="/admin/moderation">
          <Button variant="outline">
            <Icon name="video" className="h-4 w-4" />
            Moderation queue
            {videoStats.pendingCount + videoStats.reportedCount > 0 && (
              <span className="ml-1 rounded-full bg-[var(--color-danger)] text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] text-center">
                {videoStats.pendingCount + videoStats.reportedCount}
              </span>
            )}
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{videoStats.totalVideos}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Total videos</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{videoStats.approvedCount}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Live / approved</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{videoStats.pendingCount}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Awaiting review</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-2xl font-display font-bold text-[var(--color-ink)]">{videoStats.reportedCount}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">Reported</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Uploads over time</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">All submissions, day by day (pending, approved and rejected).</p>
          <TimeSeriesChart points={videoStats.uploadsOverTime} emptyLabel="No uploads yet." chartTitle="Total video uploads over time" countLabel="New uploads" />
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Most-viewed videos</h2>
            {videoStats.mostViewed.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-muted)]">No approved videos yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {videoStats.mostViewed.map((v) => (
                  <li key={v.id} className="flex items-center justify-between text-sm gap-3">
                    <span className="text-[var(--color-ink)] truncate">{v.title}</span>
                    <span className="text-[var(--color-ink-faint)] shrink-0">
                      {v.viewCount} views · {v.helpfulCount} helpful
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Statements with no videos yet</h2>
            <p className="text-sm text-[var(--color-ink-muted)] mb-3">Gaps to target for new tips.</p>
            {videoStats.statementsWithNoVideos.length === 0 ? (
              <p className="text-sm text-[var(--color-success)]">Every active statement has at least one video!</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {videoStats.statementsWithNoVideos.map((s) => (
                  <li key={s.skillId} className="text-sm">
                    <span className="text-[var(--color-ink)]">{s.skillTitle}</span>
                    <span className="text-[var(--color-ink-faint)]"> — {s.areaName} · {s.levelName}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h2 className="font-display font-bold text-[var(--color-ink)]">Jisc checkpoint completion</h2>
            <Link href="/admin/settings" className="text-xs text-[var(--color-brand-text)] hover:underline">
              Edit link/dates in Settings →
            </Link>
          </div>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            Self-reported — staff tick this themselves after completing the Jisc assessment, it isn&apos;t verified.
          </p>
          {checkpointStats.currentWindow ? (
            <div className="rounded-2xl bg-[var(--color-brand-soft)] p-4 mb-4">
              <p className="text-2xl font-display font-bold text-[var(--color-ink)]">
                {checkpointStats.currentWindow.completedCount} / {checkpointStats.totalStaff}
              </p>
              <p className="text-sm text-[var(--color-brand-text)] font-medium">
                staff have self-reported completing the {checkpointStats.currentWindow.label} checkpoint
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">No checkpoint window is currently open.</p>
          )}
          {checkpointStats.recentWindows.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)] mb-2">Previous windows</p>
              <ul className="space-y-1.5">
                {checkpointStats.recentWindows.map((w) => (
                  <li key={w.windowKey} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-ink)]">{w.label}</span>
                    <span className="text-[var(--color-ink-faint)] tabular-nums">
                      {w.completedCount} / {checkpointStats.totalStaff}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
