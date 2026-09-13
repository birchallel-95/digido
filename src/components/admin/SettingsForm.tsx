"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStageCompletionThreshold } from "@/lib/adminActions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export function SettingsForm({ threshold }: { threshold: number }) {
  const router = useRouter();
  const [value, setValue] = useState(threshold);
  const [saved, setSaved] = useState(false);

  async function save() {
    await updateStageCompletionThreshold(value);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
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
  );
}
