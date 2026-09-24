"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCheckpointSettings } from "@/lib/checkpointAdmin";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import type { CheckpointSettings } from "@/lib/checkpoint";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MonthDayPicker({
  label,
  month,
  day,
  onChange,
}: {
  label: string;
  month: number;
  day: number;
  onChange: (month: number, day: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-ink-faint)] mb-1">{label}</label>
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => onChange(Number(e.target.value), day)}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-2 text-sm"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={31}
          value={day}
          onChange={(e) => onChange(month, Number(e.target.value))}
          className="w-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-2 text-sm"
        />
      </div>
    </div>
  );
}

export function CheckpointSettingsForm({ settings }: { settings: CheckpointSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CheckpointSettings>(key: K, value: CheckpointSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const res = await updateCheckpointSettings(form);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardBody className="pt-5 max-w-lg">
        <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Jisc digital capabilities checkpoint</h2>
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          The dashboard reminder that invites staff to complete the Jisc assessment twice a year. Turn it off, change
          the assessment link, or adjust the window dates for your college below.
        </p>

        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            role="switch"
            aria-checked={form.enabled}
            onClick={() => set("enabled", !form.enabled)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ background: form.enabled ? "var(--color-brand)" : "var(--color-border)" }}
          >
            <span
              className="inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform shadow"
              style={{ transform: form.enabled ? "translateX(22px)" : "translateX(3px)" }}
            />
          </button>
          <span className="text-sm font-medium text-[var(--color-ink)]">
            {form.enabled ? "Reminder is shown to staff" : "Reminder is switched off"}
          </span>
        </div>

        {form.enabled && (
          <div className="space-y-5 mb-5">
            <div>
              <label htmlFor="checkpoint-link" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                Jisc assessment link
              </label>
              <input
                id="checkpoint-link"
                type="url"
                value={form.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Autumn window (sets the starting benchmark)</p>
              <div className="grid grid-cols-2 gap-3">
                <MonthDayPicker
                  label="Opens"
                  month={form.autumnStartMonth}
                  day={form.autumnStartDay}
                  onChange={(m, d) => setForm((f) => ({ ...f, autumnStartMonth: m, autumnStartDay: d }))}
                />
                <MonthDayPicker
                  label="Closes"
                  month={form.autumnEndMonth}
                  day={form.autumnEndDay}
                  onChange={(m, d) => setForm((f) => ({ ...f, autumnEndMonth: m, autumnEndDay: d }))}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Summer window (shows progress made)</p>
              <div className="grid grid-cols-2 gap-3">
                <MonthDayPicker
                  label="Opens"
                  month={form.summerStartMonth}
                  day={form.summerStartDay}
                  onChange={(m, d) => setForm((f) => ({ ...f, summerStartMonth: m, summerStartDay: d }))}
                />
                <MonthDayPicker
                  label="Closes"
                  month={form.summerEndMonth}
                  day={form.summerEndDay}
                  onChange={(m, d) => setForm((f) => ({ ...f, summerEndMonth: m, summerEndDay: d }))}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-[var(--color-danger)] mb-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            Save
          </Button>
          {saved && <span className="text-sm text-[var(--color-success)]">Saved</span>}
        </div>
      </CardBody>
    </Card>
  );
}
