import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getOrganisationalAnalytics } from "@/lib/adminAnalytics";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const data = await getOrganisationalAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Administration</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Aggregated, anonymised organisational trends — individual staff self-assessments are never shown here.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/users", icon: "user", title: "Staff accounts", desc: "See who's signed up, their role and onboarding status." },
          { href: "/admin/skills", icon: "spreadsheet", title: "Manage skills", desc: "Add, edit, reorder and deactivate capability skills." },
          { href: "/admin/pedtech", icon: "book", title: "PedTech facts", desc: "Curate the daily PedTech fact content." },
          { href: "/admin/import", icon: "upload", title: "Import from spreadsheet", desc: "Bulk-import or update skills from CSV." },
          { href: "/admin/settings", icon: "settings", title: "Settings", desc: "Configure stage completion threshold and defaults." },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full hover:shadow-[var(--shadow-raised)] transition-shadow">
              <CardBody className="pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] mb-3">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <h2 className="font-semibold text-[var(--color-ink)]">{item.title}</h2>
                <p className="text-sm text-[var(--color-ink-muted)] mt-1">{item.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardBody className="pt-5">
            <p className="text-3xl font-display font-bold text-[var(--color-ink)]">{data.totalStaff}</p>
            <p className="text-sm text-[var(--color-ink-faint)]">Staff with accounts</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <p className="text-3xl font-display font-bold text-[var(--color-ink)]">{data.percentProgressing}%</p>
            <p className="text-sm text-[var(--color-ink-faint)]">Actively progressing in at least one area</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Strongest capability areas</h2>
            <ul className="space-y-2.5">
              {data.strongest.map((a) => (
                <li key={a.areaId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                    {a.areaName}
                  </span>
                  <span className="font-semibold" style={{ color: a.color }}>
                    {a.averagePercent}% avg
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Largest development opportunities</h2>
            <ul className="space-y-2.5">
              {data.gaps.map((a) => (
                <li key={a.areaId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                    {a.areaName}
                  </span>
                  <span className="font-semibold text-[var(--color-ink-muted)]">{a.averagePercent}% avg</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Navigator / Elevator / Catalyst distribution</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-ink-faint)]">
                  <th className="py-2 pr-4 font-medium">Area</th>
                  <th className="py-2 px-2 font-medium text-center">Navigator</th>
                  <th className="py-2 px-2 font-medium text-center">Elevator</th>
                  <th className="py-2 px-2 font-medium text-center">Catalyst</th>
                </tr>
              </thead>
              <tbody>
                {data.levelDistribution.map((row) => (
                  <tr key={row.areaName} className="border-t border-[var(--color-border)]">
                    <td className="py-2 pr-4 font-medium text-[var(--color-ink)]">{row.areaName}</td>
                    <td className="py-2 px-2 text-center">{row.counts.Navigator}</td>
                    <td className="py-2 px-2 text-center">{row.counts.Elevator}</td>
                    <td className="py-2 px-2 text-center">{row.counts.Catalyst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Most common development needs</h2>
            {data.mostCommonDevelopmentNeeds.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-muted)]">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.mostCommonDevelopmentNeeds.map((s, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-ink)]">{s.title}</span>
                    <span className="text-[var(--color-ink-faint)]">{s.count} staff</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Capability areas with strongest momentum</h2>
            <ul className="space-y-2">
              {data.strongestMomentum.map((a) => (
                <li key={a.areaName} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                    {a.areaName}
                  </span>
                  <span className="text-[var(--color-ink-faint)]">{a.activityCount} actions (30d)</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
