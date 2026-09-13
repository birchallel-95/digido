"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, updateWeeklyTarget } from "@/lib/profileActions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export function ProfileForm({
  name,
  email,
  department,
  jobTitle,
  weeklyTarget,
}: {
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  weeklyTarget: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name, department, jobTitle });
  const [target, setTarget] = useState(weeklyTarget);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedTarget, setSavedTarget] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile(form);
    setSavedProfile(true);
    router.refresh();
    setTimeout(() => setSavedProfile(false), 2500);
  }

  async function saveTarget(value: number) {
    setTarget(value);
    await updateWeeklyTarget(value);
    setSavedTarget(true);
    router.refresh();
    setTimeout(() => setSavedTarget(false), 2000);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Your details</h2>
          <form onSubmit={saveProfile} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                Email
              </label>
              <input id="email" value={email} disabled className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]" />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                Full name
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
              />
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                Job title
              </label>
              <input
                id="jobTitle"
                value={form.jobTitle}
                onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                Department
              </label>
              <input
                id="department"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Save changes</Button>
              {savedProfile && <span className="text-sm text-[var(--color-success)]">Saved</span>}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="pt-5">
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Weekly development goal</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            How many days a week do you want to aim to make a digital improvement? There&apos;s no penalty for a quieter week.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => saveTarget(n)}
                aria-pressed={target === n}
                className="h-11 w-11 rounded-full border text-sm font-semibold transition-colors"
                style={{
                  borderColor: target === n ? "var(--color-brand)" : "var(--color-border)",
                  background: target === n ? "var(--color-brand)" : "var(--color-surface-raised)",
                  color: "var(--color-ink)",
                }}
              >
                {n}
              </button>
            ))}
            {savedTarget && <span className="text-sm text-[var(--color-success)] ml-2">Saved</span>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
