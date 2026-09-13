import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PedTechManager } from "@/components/admin/PedTechManager";

export default async function AdminPedTechPage() {
  await requireAdmin();
  const rows = await prisma.pedTechFact.findMany({ orderBy: { createdAt: "desc" } });
  const facts = rows.map((f) => ({
    id: f.id,
    title: f.title,
    fact: f.fact,
    category: f.category,
    source: f.source ?? "",
    sourceUrl: f.sourceUrl ?? "",
    active: f.active,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">PedTech facts</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">Curated content only — facts are never AI-generated on the fly.</p>
      </div>
      <PedTechManager facts={facts} />
    </div>
  );
}
