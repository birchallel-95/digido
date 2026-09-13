"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPedTechFact, updatePedTechFact, deletePedTechFact, type PedTechFactInput } from "@/lib/adminActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PEDTECH_CATEGORIES } from "@/lib/constants";

interface Fact extends PedTechFactInput {
  id: string;
}

const EMPTY: PedTechFactInput = { title: "", fact: "", category: "DIGITAL_PEDAGOGY", source: "", sourceUrl: "", active: true };

export function PedTechManager({ facts }: { facts: Fact[] }) {
  const router = useRouter();
  const [form, setForm] = useState<PedTechFactInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]";

  function edit(f: Fact) {
    setEditingId(f.id);
    setForm({ title: f.title, fact: f.fact, category: f.category, source: f.source ?? "", sourceUrl: f.sourceUrl ?? "", active: f.active });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editingId) await updatePedTechFact(editingId, form);
    else await createPedTechFact(form);
    setForm(EMPTY);
    setEditingId(null);
    setSaving(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this fact?")) return;
    await deletePedTechFact(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 space-y-4">
        <h2 className="font-display font-bold text-[var(--color-ink)]">{editingId ? "Edit fact" : "Add a PedTech fact"}</h2>
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Title</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Fact</label>
          <textarea value={form.fact} onChange={(e) => setForm((f) => ({ ...f, fact: e.target.value }))} className={inputClass} rows={2} required />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputClass}>
              {PEDTECH_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Source (optional)</label>
            <input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Source URL (optional)</label>
            <input value={form.sourceUrl} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} className={inputClass} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {editingId ? "Save changes" : "Add fact"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {facts.map((f) => (
          <div key={f.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wide">{f.category.replaceAll("_", " ")}</p>
              <p className="font-semibold text-[var(--color-ink)]">{f.title}</p>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">{f.fact}</p>
              {!f.active && <p className="text-xs text-[var(--color-ink-faint)] mt-1">Inactive</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => edit(f)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)]" aria-label="Edit fact">
                <Icon name="edit" className="h-4 w-4" />
              </button>
              <button onClick={() => remove(f.id)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sunken)] text-[var(--color-danger)]" aria-label="Delete fact">
                <Icon name="delete" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
