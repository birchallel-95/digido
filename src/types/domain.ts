import type { LevelName, SkillStatusValue } from "@/lib/constants";

export interface SkillWithStatus {
  id: string;
  title: string;
  description: string;
  practicalOutcome: string;
  whyItMatters: string | null;
  howToSteps: string[];
  benefitCategories: string[];
  tool: string | null;
  estimatedTimeMins: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  learningResourceUrl: string | null;
  evidencePrompt: string | null;
  order: number;
  levelName: LevelName;
  capabilityAreaId: string;
  capabilityAreaName: string;
  status: SkillStatusValue | null; // null = never assessed
  statusUpdatedAt: string | null;
  isPriority: boolean;
}

export interface LevelProgress {
  levelName: LevelName;
  totalSkills: number;
  masteredCount: number;
  inProgressCount: number;
  toDevelopCount: number;
  unassessedCount: number;
  percentComplete: number; // mastered / total, 0-100
  isComplete: boolean; // percentComplete >= threshold
  isLocked: boolean; // previous level not yet complete
}

export interface AreaProgress {
  areaId: string;
  areaName: string;
  shortName: string | null;
  description: string;
  color: string;
  icon: string | null;
  levels: LevelProgress[]; // Navigator, Elevator, Catalyst in order
  overallPercent: number; // across all active levels
  currentLevel: LevelName; // highest unlocked level the user is working in
}

export interface MomentumSummary {
  currentStreak: number;
  longestStreak: number;
  totalDevelopmentDays: number;
  activeDaysThisWeek: number;
  weeklyTarget: number;
  skillsImprovedThisWeek: number;
  skillsMasteredThisMonth: number;
  last7Days: { date: string; active: boolean }[]; // for the weekly strip, Mon-Sun of current week
}

export interface RecommendationResult {
  skillId: string;
  areaId: string;
  areaName: string;
  areaColor: string;
  levelName: LevelName;
  title: string;
  whyItMatters: string | null;
  practicalOutcome: string;
  howToSteps: string[];
  estimatedTimeMins: number | null;
  reason: string; // human-readable "why we suggested this"
  reasonRank: number; // 1-6, matches priority order in the brief
}
