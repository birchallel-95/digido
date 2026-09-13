import { BENEFIT_LABELS, type BenefitCategory } from "@/lib/constants";
import clsx from "clsx";

export function BenefitTag({ category, className }: { category: BenefitCategory; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        "bg-[var(--color-brand-soft)] text-[var(--color-brand-text)] border border-[var(--color-brand-light)]",
        className
      )}
    >
      {BENEFIT_LABELS[category] ?? category}
    </span>
  );
}
