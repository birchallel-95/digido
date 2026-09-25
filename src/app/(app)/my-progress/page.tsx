import { requireUser } from "@/lib/session";
import { getSkillsByStatus } from "@/lib/lists";
import { getAchievementsData } from "@/lib/achievements";
import { computeUserProgress } from "@/lib/progression";
import { MyProgressTabs, type ViewKey } from "@/components/lists/MyProgressTabs";

const VALID_VIEWS: ViewKey[] = ["to-develop", "in-progress", "achieved"];

export default async function MyProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireUser();
  const { view } = await searchParams;
  const initialView = VALID_VIEWS.includes(view as ViewKey) ? (view as ViewKey) : "to-develop";

  const [toDevelop, inProgress, achievements, areaProgress] = await Promise.all([
    getSkillsByStatus(user.id, "TO_DEVELOP"),
    getSkillsByStatus(user.id, "IN_PROGRESS"),
    getAchievementsData(user.id),
    computeUserProgress(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">My Progress</h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Where you need to improve, what you&apos;re working on, and what you&apos;ve achieved — all in one place.
        </p>
      </div>

      <MyProgressTabs
        toDevelop={toDevelop}
        inProgress={inProgress}
        achieved={achievements.masteredSkills}
        earnedBadges={achievements.badges.filter((b) => b.earned)}
        earnedMilestones={achievements.milestones.filter((m) => m.earned)}
        areaProgress={areaProgress}
        initialView={initialView}
      />
    </div>
  );
}
