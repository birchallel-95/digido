import { LEVEL_META, type LevelName } from "@/lib/constants";
import { Icon } from "@/components/ui/Icon";
import clsx from "clsx";

const ICON_BY_LEVEL: Record<LevelName, string> = {
  Navigator: "compass",
  Elevator: "trending-up",
  Catalyst: "sparkles",
};

/**
 * Level identity badge. Distinctiveness comes from icon + label + colour
 * together (never colour alone), per WCAG guidance in the brief.
 */
export function LevelBadge({
  level,
  size = "md",
  className,
}: {
  level: LevelName;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = LEVEL_META[level];
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-semibold",
        size === "sm" ? "gap-1 px-2 py-0.5 text-xs" : "gap-1.5 px-3 py-1 text-sm",
        className
      )}
      style={{ background: `${meta.color}1a`, color: meta.color }}
    >
      <Icon name={ICON_BY_LEVEL[level]} className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {level}
    </span>
  );
}
