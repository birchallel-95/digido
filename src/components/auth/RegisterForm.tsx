"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/lib/authActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await registerUser({ name, email, password, department });
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    const signInResult = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInResult?.error) {
      router.push("/login");
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 sm:p-8">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-1">Create your account</h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">Start building your digital capability today.</p>

      {googleEnabled && (
        <>
          <Button type="button" variant="outline" className="w-full mb-4" onClick={() => signIn("google", { callbackUrl: "/onboarding" })}>
            Continue with Google
          </Button>
          <div className="flex items-center gap-3 mb-4 text-xs text-[var(--color-ink-faint)]">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            or
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
            Full name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
          />
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
            Department <span className="text-[var(--color-ink-faint)] font-normal">(optional)</span>
          </label>
          <input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-hint"
            className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
          />
          <p id="password-hint" className="mt-1 text-xs text-[var(--color-ink-faint)]">
            At least 8 characters.
          </p>
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-[var(--color-danger)]">
            <Icon name="info" className="h-4 w-4" /> {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-[var(--color-ink-muted)]">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-[var(--color-brand-text)] hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
