import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ImportWizard } from "@/components/admin/ImportWizard";

export default async function AdminImportPage() {
  await requireAdmin();
  const [areas, levels] = await Promise.all([
    prisma.capabilityArea.findMany({ select: { name: true } }),
    prisma.level.findMany({ select: { name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">Import from spreadsheet</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Upload a CSV export of your capability spreadsheet. Existing skills with a matching title and area are
          updated; everything else is added as new.
        </p>
      </div>
      <ImportWizard knownAreas={areas.map((a) => a.name)} knownLevels={levels.map((l) => l.name)} />
    </div>
  );
}
