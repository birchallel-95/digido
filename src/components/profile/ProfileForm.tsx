"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, updateWeeklyTarget, updatePlatformPreference } from "@/lib/profileActions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PLATFORM_LABELS, type PlatformPreference } from "@/lib/constants";

const PLATFORM_OPTIONS: { value: PlatformPreference; icon: string }[] = [
  { value: "GOOGLE", icon: "cloud" },
  { value: "MICROSOFT", icon: "building" },
  { value: "BOTH", icon: "layers" },
];

export function ProfileForm({
  name,
  email,
  department,
  jobTitle,
  weeklyTarget,
  platformPreference,
}: {
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  weeklyTarget: number;
  platformPreference: PlatformPreference;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name, department, jobTitle });
  const [target, setTarget] = useState(weeklyTarget);
  const [platform, setPlatform] = useState(platformPreference);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedTarget, setSavedTarget] = useState(false);
  const [savedPlatform, setSavedPlatform] = useState(false);

  async function savePlatform(value: PlatformPreference) {
    setPlatform(value);
    await updatePlatformPreference(value);
    setSavedPlatform(true);
    router.refresh();
    setTimeout(() => setSavedPlatform(false), 2000);
  }

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
          <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Digital platform</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            Skills, examples and step-by-step instructions are tailored to whichever platform your school or organisation uses.
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            {PLATFORM_OPTIONS.map((opt) => {
              const selected = platform === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => savePlatform(opt.value)}
                  aria-pressed={selected}
                  className="rounded-xl border-2 p-3 flex items-center gap-2.5 text-left transition-colors"
                  style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-border)" }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: selected ? "var(--color-brand)" : "var(--color-surface-sunken)",
                      color: "var(--color-ink)",
                    }}
                  >
                    <Icon name={opt.icon} className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-[var(--color-ink)]">{PLATFORM_LABELS[opt.value]}</span>
                </button>
              );
            })}
          </div>
          {savedPlatform && <span className="text-sm text-[var(--color-success)] mt-2 inline-block">Saved</span>}
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
