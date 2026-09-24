// Pure date logic for the twice-yearly Jisc checkpoint reminder — no DB
// access here, so it's easy to reason about (and test) independently of
// storage. Settings come from src/lib/checkpointConfig.ts.

export type CheckpointSeason = "autumn" | "summer";

export interface CheckpointSettings {
  enabled: boolean;
  linkUrl: string;
  autumnStartMonth: number; // 1-12
  autumnStartDay: number;
  autumnEndMonth: number;
  autumnEndDay: number;
  summerStartMonth: number;
  summerStartDay: number;
  summerEndMonth: number;
  summerEndDay: number;
}

export const DEFAULT_CHECKPOINT_SETTINGS: CheckpointSettings = {
  enabled: true,
  linkUrl: "https://rnngroup.potential.ly/playlists/question-bank/assessments/overall-digital-capabilities/page/1",
  autumnStartMonth: 9,
  autumnStartDay: 1,
  autumnEndMonth: 10,
  autumnEndDay: 31,
  summerStartMonth: 5,
  summerStartDay: 1,
  summerEndMonth: 6,
  summerEndDay: 30,
};

export type CheckpointWindowState =
  | { status: "open"; season: CheckpointSeason; windowKey: string; label: string; closesOn: Date }
  | { status: "closed"; season: CheckpointSeason; label: string; opensOn: Date };

const SEASON_LABEL: Record<CheckpointSeason, string> = {
  autumn: "Autumn checkpoint",
  summer: "Summer checkpoint",
};

function toUtcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

function toUtcEndOfDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
}

/**
 * Windows are assumed not to wrap across a calendar year (end >= start
 * within the same year) — true for both the default Sep-Oct / May-Jun
 * ranges and any sane admin-configured replacement. The settings form
 * enforces end-after-start to keep that true.
 */
export function computeCheckpointWindow(settings: CheckpointSettings, now: Date = new Date()): CheckpointWindowState {
  const year = now.getUTCFullYear();

  const windows: { season: CheckpointSeason; start: Date; end: Date }[] = [
    {
      season: "autumn",
      start: toUtcDate(year, settings.autumnStartMonth, settings.autumnStartDay),
      end: toUtcEndOfDay(year, settings.autumnEndMonth, settings.autumnEndDay),
    },
    {
      season: "summer",
      start: toUtcDate(year, settings.summerStartMonth, settings.summerStartDay),
      end: toUtcEndOfDay(year, settings.summerEndMonth, settings.summerEndDay),
    },
  ];

  for (const w of windows) {
    if (now >= w.start && now <= w.end) {
      return {
        status: "open",
        season: w.season,
        windowKey: `${year}-${w.season}`,
        label: SEASON_LABEL[w.season],
        closesOn: w.end,
      };
    }
  }

  // Not currently open — find the nearest future window start, checking
  // both seasons in both this year and next (handles being past both
  // windows this year, e.g. in November or December).
  const candidates = (
    [
      { season: "autumn" as const, y: year, m: settings.autumnStartMonth, d: settings.autumnStartDay },
      { season: "summer" as const, y: year, m: settings.summerStartMonth, d: settings.summerStartDay },
      { season: "autumn" as const, y: year + 1, m: settings.autumnStartMonth, d: settings.autumnStartDay },
      { season: "summer" as const, y: year + 1, m: settings.summerStartMonth, d: settings.summerStartDay },
    ] as const
  )
    .map((c) => ({ season: c.season, start: toUtcDate(c.y, c.m, c.d) }))
    .filter((c) => c.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const next = candidates[0];
  return {
    status: "closed",
    season: next.season,
    label: SEASON_LABEL[next.season],
    opensOn: next.start,
  };
}

export function formatCheckpointDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}
