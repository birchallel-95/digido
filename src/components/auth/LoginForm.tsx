"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 sm:p-8">
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-1">Welcome back</h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-6">Sign in to continue your digital development.</p>

      {googleEnabled && (
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={() => signIn("google", { callbackUrl })}
          >
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
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-text)]"
          />
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-[var(--color-danger)]">
            <Icon name="info" className="h-4 w-4" /> {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-[var(--color-ink-muted)]">
        New here?{" "}
        <a href="/register" className="font-medium text-[var(--color-brand-text)] hover:underline">
          Create an account
        </a>
      </p>
      <p className="mt-3 text-xs text-center text-[var(--color-ink-faint)]">
        Demo: birchallel@gmail.com / Password123!
      </p>
    </div>
  );
}
