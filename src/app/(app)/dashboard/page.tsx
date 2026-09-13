import { requireUser } from "@/lib/session";
import { getDashboardData } from "@/lib/dashboard";
import { Card, CardBody } from "@/components/ui/Card";
import { RadarChart } from "@/components/dashboard/RadarChart";
import { MomentumWidget } from "@/components/dashboard/MomentumWidget";
import { DailyStepCard } from "@/components/dashboard/DailyStepCard";
import { JourneyCard } from "@/components/dashboard/JourneyCard";
import { NearlyThere } from "@/components/dashboard/NearlyThere";
import { RecentAchievements } from "@/components/dashboard/RecentAchievements";
import { PedTechFactCard } from "@/components/dashboard/PedTechFactCard";
import { Icon } from "@/components/ui/Icon";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const firstName = (user.name ?? "there").split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
          {getGreeting()}, {firstName}.
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          You&apos;re making progress across {data.areasWithProgress} of your 6 digital capability areas.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardBody className="pt-5">
            <MomentumWidget momentum={data.momentum} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2 border-[var(--color-brand-light)]">
          <CardBody className="pt-5">
            <DailyStepCard recommendation={data.recommendation} />
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-1">Digital Capability Profile</h2>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">Your progress across all six areas, updated as you go.</p>
            <RadarChart areas={data.progress} />
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardBody className="pt-5">
              <NearlyThere items={data.nearlyThere} />
              {data.nearlyThere.length === 0 && (
                <p className="text-sm text-[var(--color-ink-muted)]">Keep going — your next milestone will show up here.</p>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="pt-5">
              <PedTechFactCard fact={data.pedTechFact} />
            </CardBody>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-[var(--color-ink)] mb-3">My Journeys</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.progress.map((area) => (
            <JourneyCard key={area.areaId} area={area} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardBody className="pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="chart" className="h-4.5 w-4.5 text-[var(--color-brand)]" />
              <h2 className="font-display font-bold text-[var(--color-ink)]">My Digital Week</h2>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-[var(--color-ink)]">
                <Icon name="flame" className="h-4 w-4 text-[var(--color-warning)]" />
                {data.weeklySummary.activeDays} active development day{data.weeklySummary.activeDays === 1 ? "" : "s"}
              </li>
              <li className="flex items-center gap-2 text-[var(--color-ink)]">
                <Icon name="check" className="h-4 w-4 text-[var(--color-success)]" />
                {data.weeklySummary.skillsMastered} skill{data.weeklySummary.skillsMastered === 1 ? "" : "s"} mastered
              </li>
              <li className="flex items-center gap-2 text-[var(--color-ink)]">
                <Icon name="arrow-up" className="h-4 w-4 text-[var(--color-elevator)]" />
                {data.weeklySummary.skillsStarted} skill{data.weeklySummary.skillsStarted === 1 ? "" : "s"} moved into progress
              </li>
              {data.weeklySummary.levelsCompleted > 0 && (
                <li className="flex items-center gap-2 text-[var(--color-ink)]">
                  <Icon name="trophy" className="h-4 w-4 text-[var(--color-catalyst)]" />
                  {data.weeklySummary.levelsCompleted} pathway{data.weeklySummary.levelsCompleted === 1 ? "" : "s"} completed
                </li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="pt-5">
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-4">Recent Achievements</h2>
            <RecentAchievements items={data.recentAchievements} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
