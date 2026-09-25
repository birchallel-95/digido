"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { TagPickerArea } from "@/lib/videoActions";

/** Cascading Jisc element -> tier -> statement picker, multi-select. */
export function CapabilityTagPicker({
  areas,
  selected,
  onChange,
}: {
  areas: TagPickerArea[];
  selected: { id: string; title: string; areaName: string; levelName: string }[];
  onChange: (next: { id: string; title: string; areaName: string; levelName: string }[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [openAreaId, setOpenAreaId] = useState<string | null>(areas[0]?.id ?? null);
  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  const q = query.trim().toLowerCase();

  function toggle(skillId: string, title: string, areaName: string, levelName: string) {
    if (selectedIds.has(skillId)) {
      onChange(selected.filter((s) => s.id !== skillId));
    } else {
      onChange([...selected, { id: skillId, title, areaName, levelName }]);
    }
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selected.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(selected.filter((x) => x.id !== s.id))}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] border border-[var(--color-brand-light)] px-2.5 py-1 text-xs font-medium"
            >
              {s.title}
              <Icon name="x" className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search capability statements…"
        aria-label="Search capability statements"
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm mb-3"
      />

      <div className="rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] max-h-80 overflow-y-auto">
        {areas.map((area) => {
          const matchingLevels = q
            ? area.levels
                .map((l) => ({ ...l, skills: l.skills.filter((s) => s.title.toLowerCase().includes(q)) }))
                .filter((l) => l.skills.length > 0)
            : area.levels;
          if (q && matchingLevels.length === 0) return null;
          const isOpen = q ? true : openAreaId === area.id;

          return (
            <div key={area.id}>
              <button
                type="button"
                onClick={() => setOpenAreaId(isOpen && !q ? null : area.id)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
              >
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: area.color }} aria-hidden />
                <span className="font-medium text-sm text-[var(--color-ink)] flex-1">{area.name}</span>
                <Icon name="chevron" className={`h-4 w-4 text-[var(--color-ink-faint)] transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-3 space-y-3">
                  {matchingLevels.map((level) => (
                    <div key={level.id}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)] mb-1.5">{level.name}</p>
                      <div className="space-y-1">
                        {level.skills.map((skill) => (
                          <label key={skill.id} className="flex items-start gap-2 text-sm text-[var(--color-ink)] py-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(skill.id)}
                              onChange={() => toggle(skill.id, skill.title, area.name, level.name)}
                              className="mt-0.5"
                            />
                            {skill.title}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
