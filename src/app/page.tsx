import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { LevelBadge } from "@/components/ui/LevelBadge";

const AREAS = [
  { name: "Digital Proficiency & Productivity", icon: "gauge", color: "#2563EB" },
  { name: "Information, Data & Media Literacies", icon: "search", color: "#0891B2" },
  { name: "Digital Creation & Innovation", icon: "wand-2", color: "#7C3AED" },
  { name: "Digital Communication & Collaboration", icon: "messages-square", color: "#DB2777" },
  { name: "Digital Learning & Development", icon: "graduation-cap", color: "#EA580C" },
  { name: "Digital Identity & Wellbeing", icon: "heart-handshake", color: "#16A34A" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand)] text-[var(--color-ink)]">
            <Icon name="compass" className="h-4.5 w-4.5" />
          </span>
          DigiDo
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] px-3 py-2">
            Sign in
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] px-3 py-1 text-xs font-semibold mb-5">
            For Further Education staff
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-ink)] leading-[1.1]">
            Build your digital capability, one practical improvement at a time.
          </h1>
          <p className="mt-5 text-lg text-[var(--color-ink-muted)] max-w-xl">
            A quick, personalised way to check in on your digital skills, see what to develop next, and track the
            practical difference it makes — not another audit you complete once and forget.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">Start your check-in</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                I already have an account
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-[var(--color-ink-muted)]">
            <div className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-[var(--color-success)]" />
              Private by default
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-[var(--color-success)]" />
              Two minutes to start
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-[var(--color-success)]" />
              No guilt, ever
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-raised)] p-6 sm:p-8 mx-auto max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <LevelBadge level="Navigator" size="sm" />
              <span className="text-xs text-[var(--color-ink-faint)]">Card 4 of 18</span>
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--color-ink)] mb-2">
              Create a basic Google Form to check learner understanding
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              Quick digital checks can help identify misconceptions before learners leave a session.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] px-2.5 py-1 text-xs font-medium">
                Assessment
              </span>
              <span className="rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] px-2.5 py-1 text-xs font-medium">
                Time saving
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div className="rounded-xl border border-[var(--color-border)] py-3 text-[var(--color-ink-muted)]">
                ← Need to learn
              </div>
              <div className="rounded-xl border border-[var(--color-border)] py-3 text-[var(--color-ink-muted)]">
                ↑ Working on it
              </div>
              <div className="rounded-xl bg-[var(--color-success-soft)] py-3 text-[var(--color-success)]">
                I&apos;ve got this →
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-surface-sunken)] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-[var(--color-ink)]">
            Six capability areas. Three stages each.
          </h2>
          <p className="text-center text-[var(--color-ink-muted)] mt-2 max-w-2xl mx-auto">
            Progress independently in each area — Navigator, then Elevator, then Catalyst — at your own pace.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AREAS.map((area) => (
              <div
                key={area.name}
                className="rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-5 flex items-start gap-3"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${area.color}1a`, color: area.color }}
                >
                  <Icon name={area.icon} className="h-5 w-5" />
                </span>
                <div className="font-medium text-[var(--color-ink)]">{area.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 grid sm:grid-cols-3 gap-8">
        {[
          { icon: "target", title: "Practical, not theoretical", body: "Every skill connects to a real outcome — time saved, better accessibility, stronger engagement." },
          { icon: "flame", title: "Momentum, not streak guilt", body: "Small, regular progress is celebrated. Missing a day is never treated as failure." },
          { icon: "award", title: "A record that grows with you", body: "Your Digital Capability Passport builds a genuine, evidence-backed professional record over time." },
        ].map((f) => (
          <div key={f.title}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] mb-4">
              <Icon name={f.icon} className="h-5 w-5" />
            </span>
            <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-1.5">{f.title}</h3>
            <p className="text-[var(--color-ink-muted)] text-sm">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-sm text-[var(--color-ink-faint)] flex flex-col sm:flex-row justify-between gap-2">
          <span>DigiDo — a development tool, not a performance record.</span>
          <span>Built for Further Education staff.</span>
        </div>
      </footer>
    </div>
  );
}
