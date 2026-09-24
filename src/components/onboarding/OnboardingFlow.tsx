"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/lib/onboardingActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { PLATFORM_LABELS, type PlatformPreference } from "@/lib/constants";

const PLATFORM_OPTIONS: { value: PlatformPreference; icon: string; desc: string }[] = [
  { value: "GOOGLE", icon: "cloud", desc: "Docs, Sheets, Slides, Gmail, Meet, Gemini…" },
  { value: "MICROSOFT", icon: "building", desc: "Word, Excel, PowerPoint, Outlook, Teams, Copilot…" },
  { value: "BOTH", icon: "layers", desc: "Show me examples from both, or I'm not sure yet." },
];

const AREAS = [
  { name: "Digital Proficiency & Productivity", icon: "gauge", color: "#2563EB" },
  { name: "Information, Data & Media Literacies", icon: "search", color: "#0891B2" },
  { name: "Digital Creation & Innovation", icon: "wand-2", color: "#7C3AED" },
  { name: "Digital Communication & Collaboration", icon: "messages-square", color: "#DB2777" },
  { name: "Digital Learning & Development", icon: "graduation-cap", color: "#EA580C" },
  { name: "Digital Identity & Wellbeing", icon: "heart-handshake", color: "#16A34A" },
];

const STEPS = ["welcome", "platform", "areas", "levels", "choices", "momentum"] as const;

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState<PlatformPreference | null>(null);
  const [finishing, setFinishing] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  async function finish() {
    setFinishing(true);
    await completeOnboarding(platform ?? "BOTH");
    // next-auth's update() only does a real server round-trip (the one that
    // re-reads onboarded from the DB) when called WITH an argument — called
    // bare, it silently sends a bodyless GET and the session never refreshes,
    // leaving the user stuck bouncing back to /onboarding forever.
    await update({});
    router.push("/discover");
    router.refresh();
  }

  const isLast = step === STEPS.length - 1;
  const onPlatformStep = STEPS[step] === "platform";
  const canContinue = !onPlatformStep || platform !== null;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      <div className="px-6 pt-6">
        <div className="flex gap-1.5 max-w-sm mx-auto">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "var(--color-brand)" : "var(--color-border)" }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {STEPS[step] === "welcome" && (
                <div className="text-center">
                  <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand-text)]">
                    <Icon name="compass" className="h-8 w-8" />
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)] mb-3">
                    Build your digital capability, one practical skill at a time.
                  </h1>
                  <p className="text-[var(--color-ink-muted)]">
                    A quick, personal check-in — not a test. Takes about two minutes to get started.
                  </p>
                </div>
              )}

              {STEPS[step] === "platform" && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-2 text-center">
                    Which does your school or organisation use?
                  </h2>
                  <p className="text-[var(--color-ink-muted)] text-center mb-6">
                    We&apos;ll tailor examples and step-by-step instructions to your tools. You can change this
                    later in your profile.
                  </p>
                  <div className="space-y-3">
                    {PLATFORM_OPTIONS.map((opt) => {
                      const selected = platform === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPlatform(opt.value)}
                          aria-pressed={selected}
                          className="w-full text-left rounded-xl border-2 bg-[var(--color-surface-raised)] p-4 flex items-start gap-3 transition-colors"
                          style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-border)" }}
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              background: selected ? "var(--color-brand)" : "var(--color-surface-sunken)",
                              color: "var(--color-ink)",
                            }}
                          >
                            <Icon name={opt.icon} className="h-4.5 w-4.5" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-[var(--color-ink)]">
                              {PLATFORM_LABELS[opt.value]}
                            </div>
                            <div className="text-xs text-[var(--color-ink-muted)]">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {STEPS[step] === "areas" && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-2 text-center">
                    Six areas of digital capability
                  </h2>
                  <p className="text-[var(--color-ink-muted)] text-center mb-6">
                    You&apos;ll progress through each independently, at your own pace.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {AREAS.map((a) => (
                      <div key={a.name} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 flex flex-col items-center text-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${a.color}1a`, color: a.color }}>
                          <Icon name={a.icon} className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-xs font-medium text-[var(--color-ink)]">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {STEPS[step] === "levels" && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-2 text-center">
                    Navigator, Elevator, Catalyst
                  </h2>
                  <p className="text-[var(--color-ink-muted)] text-center mb-6">
                    Each area has three stages. Complete one to unlock the next — only within that area.
                  </p>
                  <div className="space-y-3">
                    {[
                      { level: "Navigator" as const, tagline: "Finding the way", desc: "Learning the essentials and gaining confidence." },
                      { level: "Elevator" as const, tagline: "Lifting the standard", desc: "Raising efficiency and deepening expertise." },
                      { level: "Catalyst" as const, tagline: "Changing the game", desc: "Driving innovation and leading change." },
                    ].map((l) => (
                      <div key={l.level} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 flex items-start gap-3">
                        <LevelBadge level={l.level} size="sm" />
                        <div>
                          <div className="text-sm font-semibold text-[var(--color-ink)]">{l.tagline}</div>
                          <div className="text-xs text-[var(--color-ink-muted)]">{l.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {STEPS[step] === "choices" && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-2 text-center">
                    Three honest choices
                  </h2>
                  <p className="text-[var(--color-ink-muted)] text-center mb-6">
                    For each skill card, swipe or tap — whichever feels natural.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    <div className="rounded-xl border border-[var(--color-border)] py-4 px-2 text-[var(--color-ink-muted)]">
                      <Icon name="arrow-left" className="h-4 w-4 mx-auto mb-1" />
                      Need to learn this
                    </div>
                    <div className="rounded-xl border border-[var(--color-border)] py-4 px-2 text-[var(--color-ink-muted)]">
                      <Icon name="arrow-up" className="h-4 w-4 mx-auto mb-1" />
                      Working on this
                    </div>
                    <div className="rounded-xl bg-[var(--color-success-soft)] py-4 px-2 text-[var(--color-success)]">
                      <Icon name="arrow-right" className="h-4 w-4 mx-auto mb-1" />
                      I&apos;ve got this
                    </div>
                  </div>
                </div>
              )}

              {STEPS[step] === "momentum" && (
                <div className="text-center">
                  <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
                    <Icon name="flame" className="h-8 w-8" />
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-3">
                    Build your Digital Momentum
                  </h2>
                  <p className="text-[var(--color-ink-muted)] mb-2">
                    Small, meaningful improvements, made regularly. No leaderboards, no guilt for a quiet week —
                    just steady, visible progress.
                  </p>
                  <p className="text-sm text-[var(--color-ink-faint)]">
                    You don&apos;t need to assess every skill today. Come back anytime and pick up where you left off.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 pb-10 flex justify-center gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {!isLast ? (
          <Button onClick={() => setStep((s) => s + 1)} size="lg" disabled={!canContinue}>
            Continue
          </Button>
        ) : (
          <Button onClick={finish} size="lg" disabled={finishing}>
            {finishing ? "Getting ready…" : "Start your digital capability check-in"}
          </Button>
        )}
      </div>
    </div>
  );
}
