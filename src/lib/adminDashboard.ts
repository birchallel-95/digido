import { prisma } from "@/lib/prisma";
import { getShowReflections } from "@/lib/adminConfig";
import type { Role } from "@/lib/constants";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  lastLogin: string | null;
  totalRated: number;
  red: number; // TO_DEVELOP — "need to learn this"
  amber: number; // IN_PROGRESS — "working on it"
  green: number; // MASTERED — "I've got this"
  reflectionsCount: number;
}

export interface RagBreakdown {
  key: string;
  label: string;
  color: string; // the entity's own identity colour (area colour, or level colour) — shown as a small swatch, never the RAG hue
  red: number;
  amber: number;
  green: number;
  total: number;
}

export interface SignupPoint {
  date: string; // YYYY-MM-DD
  count: number; // sign-ups that day
  cumulative: number; // running total
}

export interface ReflectionDetail {
  id: string;
  userName: string | null;
  userEmail: string;
  skillTitle: string;
  reflection: string;
  createdAt: string;
}

export interface AdminDashboardData {
  users: AdminUserRow[];
  totalUsers: number;
  totalStatementsRated: number;
  ragTotals: { red: number; amber: number; green: number };
  byArea: RagBreakdown[]; // Jisc element
  byLevel: RagBreakdown[]; // tier — Navigator/Elevator/Catalyst
  signups: SignupPoint[];
  totalReflections: number;
  showReflections: boolean;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * The single query behind the admin dashboard. Individually-identifying
 * (per-person RAG counts, name/email) by design — this is an explicit admin
 * reporting feature, not the aggregate-only view in adminAnalytics.ts.
 * Reflection *text* is the one thing still gated: it's fetched only when
 * getShowReflections() is on, and even then via a separate call
 * (getReflectionsDetail) so a page that doesn't ask for it never pulls
 * reflection content into memory at all.
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [users, statuses, evidenceCounts, showReflections] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true, lastLogin: true },
    }),
    prisma.userSkillStatus.findMany({
      select: {
        userId: true,
        status: true,
        skill: {
          select: {
            capabilityAreaId: true,
            levelId: true,
            capabilityArea: { select: { name: true, color: true, order: true } },
            level: { select: { name: true, order: true } },
          },
        },
      },
    }),
    prisma.evidence.groupBy({ by: ["userId"], _count: { _all: true } }),
    getShowReflections(),
  ]);

  const reflectionCountByUser = new Map(evidenceCounts.map((e) => [e.userId, e._count._all]));

  const userRows: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    createdAt: u.createdAt.toISOString(),
    lastLogin: u.lastLogin?.toISOString() ?? null,
    totalRated: 0,
    red: 0,
    amber: 0,
    green: 0,
    reflectionsCount: reflectionCountByUser.get(u.id) ?? 0,
  }));
  const userRowById = new Map(userRows.map((r) => [r.id, r]));

  const areaMap = new Map<string, RagBreakdown & { order: number }>();
  const levelMap = new Map<string, RagBreakdown & { order: number }>();
  const ragTotals = { red: 0, amber: 0, green: 0 };

  for (const s of statuses) {
    const row = userRowById.get(s.userId);
    const bucket = s.status === "MASTERED" ? "green" : s.status === "IN_PROGRESS" ? "amber" : "red";

    if (row) {
      row[bucket]++;
      row.totalRated++;
    }
    ragTotals[bucket]++;

    const areaId = s.skill.capabilityAreaId;
    if (!areaMap.has(areaId)) {
      areaMap.set(areaId, {
        key: areaId,
        label: s.skill.capabilityArea.name,
        color: s.skill.capabilityArea.color,
        red: 0,
        amber: 0,
        green: 0,
        total: 0,
        order: s.skill.capabilityArea.order,
      });
    }
    const areaBucket = areaMap.get(areaId)!;
    areaBucket[bucket]++;
    areaBucket.total++;

    const levelId = s.skill.levelId;
    if (!levelMap.has(levelId)) {
      levelMap.set(levelId, {
        key: levelId,
        label: s.skill.level.name,
        color: "var(--color-ink-faint)",
        red: 0,
        amber: 0,
        green: 0,
        total: 0,
        order: s.skill.level.order,
      });
    }
    const levelBucket = levelMap.get(levelId)!;
    levelBucket[bucket]++;
    levelBucket.total++;
  }

  // Sign-ups over time: a continuous daily series from the first sign-up to
  // today (not just days with activity) so the line reads as a real trend —
  // flat where nothing happened, stepping up where sign-ups landed — rather
  // than a sparse, misleadingly-even set of points.
  const daily = new Map<string, number>();
  for (const u of users) {
    const key = dateKey(u.createdAt);
    daily.set(key, (daily.get(key) ?? 0) + 1);
  }
  // NOTE: daily granularity over the account's whole lifetime — fine at
  // demo/small-institution scale (see adminAnalytics.ts for the same caveat).
  // A long-running deployment should bucket by week/month past a few
  // hundred days rather than render one point per day indefinitely.
  const signups: SignupPoint[] = [];
  if (users.length > 0) {
    const cursor = new Date(dateKey(users[0].createdAt) + "T00:00:00Z");
    const end = new Date(dateKey(new Date()) + "T00:00:00Z");
    let running = 0;
    while (cursor <= end) {
      const key = dateKey(cursor);
      const count = daily.get(key) ?? 0;
      running += count;
      signups.push({ date: key, count, cumulative: running });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const totalReflections = [...reflectionCountByUser.values()].reduce((a, b) => a + b, 0);

  return {
    users: userRows,
    totalUsers: users.length,
    totalStatementsRated: ragTotals.red + ragTotals.amber + ragTotals.green,
    ragTotals,
    byArea: [...areaMap.values()].sort((a, b) => a.order - b.order),
    byLevel: [...levelMap.values()].sort((a, b) => a.order - b.order),
    signups,
    totalReflections,
    showReflections,
  };
}

/** Reflection text — only ever called when the admin has switched visibility on. */
export async function getReflectionsDetail(): Promise<ReflectionDetail[]> {
  const rows = await prisma.evidence.findMany({
    where: { reflection: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reflection: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      skill: { select: { title: true } },
    },
  });

  return rows
    .filter((r): r is typeof r & { reflection: string } => Boolean(r.reflection))
    .map((r) => ({
      id: r.id,
      userName: r.user.name,
      userEmail: r.user.email,
      skillTitle: r.skill.title,
      reflection: r.reflection,
      createdAt: r.createdAt.toISOString(),
    }));
}
