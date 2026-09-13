import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      <header className="px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand)] text-white">
            <Icon name="compass" className="h-4.5 w-4.5" />
          </span>
          Digital Capability Passport
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
