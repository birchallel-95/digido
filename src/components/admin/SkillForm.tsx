"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSkill, updateSkill, type SkillFormInput } from "@/lib/adminActions";
import { Button } from "@/components/ui/Button";
import { BENEFIT_CATEGORIES, BENEFIT_LABELS, type BenefitCategory } from "@/lib/constants";

interface Option {
  id: string;
  name: string;
}

export function SkillForm({
  areas,
  levels,
  skillId,
  initial,
}: {
  areas: Option[];
  levels: Option[];
  skillId?: string;
  initial?: Partial<SkillFormInput>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<SkillFormInput>({
    capabilityAreaId: initial?.capabilityAreaId ?? areas[0]?.id ?? "",
    levelId: initial?.levelId ?? levels[0]?.id ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    practicalOutcome: initial?.practicalOutcome ?? "",
    whyItMatters: initial?.whyItMatters ?? "",
    howToSteps: initial?.howToSteps ?? [],
    benefitCategories: initial?.benefitCategories ?? [],
    tool: initial?.tool ?? "",
    estimatedTimeMins: initial?.estimatedTimeMins,
    imageUrl: initial?.imageUrl ?? "",
    videoUrl: initial?.videoUrl ?? "",
    learningResourceUrl: initial?.learningResourceUrl ?? "",
    evidencePrompt: initial?.evidencePrompt ?? "",
  });
  const [howToText, setHowToText] = useState((initial?.howToSteps ?? []).join("\n"));
  const [saving, setSaving] = useState(false);

  function toggleBenefit(cat: BenefitCategory) {
    setForm((f) => ({
      ...f,
      benefitCategories: f.benefitCategories.includes(cat)
        ? f.benefitCategories.filter((c) => c !== cat)
        : [...f.benefitCategories, cat],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const howToSteps = howToText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...form, howToSteps };
    if (skillId) await updateSkill(skillId, payload);
    else await createSkill(payload);
    router.push("/admin/skills");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]";
  const labelClass = "block text-sm font-medium text-[var(--color-ink)] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Capability area</label>
          <select value={form.capabilityAreaId} onChange={(e) => setForm((f) => ({ ...f, capabilityAreaId: e.target.value }))} className={inputClass} required>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Level</label>
          <select value={form.levelId} onChange={(e) => setForm((f) => ({ ...f, levelId: e.target.value }))} className={inputClass} required>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Skill title</label>
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} required />
      </div>

      <div>
        <label className={labelClass}>Plain-English description</label>
        <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} rows={2} required />
      </div>

      <div>
        <label className={labelClass}>Practical outcome — what this lets someone do (not just &quot;use tool X&quot;)</label>
        <textarea
          value={form.practicalOutcome}
          onChange={(e) => setForm((f) => ({ ...f, practicalOutcome: e.target.value }))}
          className={inputClass}
          rows={2}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Why this matters (optional)</label>
        <textarea value={form.whyItMatters} onChange={(e) => setForm((f) => ({ ...f, whyItMatters: e.target.value }))} className={inputClass} rows={2} />
      </div>

      <div>
        <label className={labelClass}>How to do this — one step per line</label>
        <textarea
          value={howToText}
          onChange={(e) => setHowToText(e.target.value)}
          className={inputClass}
          rows={4}
          placeholder={"Open Google Forms and select Blank\nAdd your first question\nClick Send to share the form"}
        />
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
          Shown to staff as a numbered checklist wherever this skill appears — the concrete steps, not just the outcome.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Relevant tool (optional)</label>
          <input value={form.tool} onChange={(e) => setForm((f) => ({ ...f, tool: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Estimated time (minutes, optional)</label>
          <input
            type="number"
            min={0}
            value={form.estimatedTimeMins ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, estimatedTimeMins: e.target.value ? Number(e.target.value) : undefined }))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Benefit categories</label>
        <div className="flex flex-wrap gap-2">
          {BENEFIT_CATEGORIES.map((cat) => {
            const selected = form.benefitCategories.includes(cat);
            return (
              <button
                type="button"
                key={cat}
                onClick={() => toggleBenefit(cat)}
                aria-pressed={selected}
                className="rounded-full px-3 py-1.5 text-xs font-medium border transition-colors"
                style={{
                  borderColor: selected ? "var(--color-brand-text)" : "var(--color-border)",
                  background: selected ? "var(--color-brand-soft)" : "transparent",
                  color: selected ? "var(--color-brand-text)" : "var(--color-ink-muted)",
                }}
              >
                {BENEFIT_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Learning resource URL (optional)</label>
          <input value={form.learningResourceUrl} onChange={(e) => setForm((f) => ({ ...f, learningResourceUrl: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Evidence prompt (optional)</label>
          <input value={form.evidencePrompt} onChange={(e) => setForm((f) => ({ ...f, evidencePrompt: e.target.value }))} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Image URL (optional)</label>
          <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Video URL (optional)</label>
          <input value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} className={inputClass} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : skillId ? "Save changes" : "Create skill"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/skills")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
