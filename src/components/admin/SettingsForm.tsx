"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStageCompletionThreshold, setShowReflections } from "@/lib/adminActions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export function SettingsForm({ threshold, showReflections }: { threshold: number; showReflections: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(threshold);
  const [saved, setSaved] = useState(false);
  const [reflectionsOn, setReflectionsOn] = useState(showReflections);
  const [reflectionsSaved, setReflectionsSaved] = useState(false);

  async function save() {
    await updateStageCompletionThreshold(value);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  async function toggleReflections() {
    const next = !reflectionsOn;
    setReflectionsOn(next);
    await setShowReflections(next);
    setReflectionsSaved(true);
    router.refresh();
    setTimeout(() => setReflectionsSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="pt-5 max-w-md">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Stage completion threshold</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            The percentage of active skills a staff member must master to complete a stage (Navigator, Elevator or
            Catalyst) and unlock the next one. Default is 100%.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-display font-bold text-lg text-[var(--color-ink)] w-14 text-right">{value}%</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={save}>Save</Button>
            {saved && <span className="text-sm text-[var(--color-success)]">Saved</span>}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5 max-w-md">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Reflections in Admin Dashboard</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            The dashboard always shows how many reflections each person has written, but the reflection text itself
            stays hidden unless you turn this on.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={reflectionsOn}
              onClick={toggleReflections}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ background: reflectionsOn ? "var(--color-brand)" : "var(--color-border)" }}
            >
              <span
                className="inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform shadow"
                style={{ transform: reflectionsOn ? "translateX(22px)" : "translateX(3px)" }}
              />
            </button>
            <span className="text-sm font-medium text-[var(--color-ink)]">
              {reflectionsOn ? "Admins can see reflection text" : "Reflection text is hidden"}
            </span>
            {reflectionsSaved && <span className="text-sm text-[var(--color-success)]">Saved</span>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
