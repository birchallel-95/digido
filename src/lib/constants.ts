// Central source of truth for the "enum" values SQLite stores as plain
// strings (see prisma/schema.prisma header note). Keeping these as const
// tuples + derived union types gives us compile-time safety without native
// DB enums, and one place to extend when moving to Postgres.

export const ROLES = ["STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const SKILL_STATUSES = ["TO_DEVELOP", "IN_PROGRESS", "MASTERED"] as const;
export type SkillStatusValue = (typeof SKILL_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "SKILL_ASSESSED",
  "SKILL_STARTED",
  "SKILL_MASTERED",
  "RESOURCE_COMPLETED",
  "REFLECTION_ADDED",
  "EVIDENCE_ADDED",
  "LEVEL_COMPLETED",
  "MILESTONE_EARNED",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const MILESTONE_CRITERIA_TYPES = [
  "FIRST_ASSESSMENT",
  "ACTIVE_DAYS_TOTAL",
  "SKILLS_MASTERED_TOTAL",
  "LEVEL_COMPLETED_ANY",
  "LEVEL_COMPLETED_SPECIFIC",
  "ALL_AREAS_STARTED",
] as const;
export type MilestoneCriteriaType = (typeof MILESTONE_CRITERIA_TYPES)[number];

export const PEDTECH_CATEGORIES = [
  "AI",
  "GOOGLE_WORKSPACE",
  "DIGITAL_PEDAGOGY",
  "ACCESSIBILITY",
  "COGNITIVE_SCIENCE",
  "DIGITAL_WELLBEING",
  "ASSESSMENT",
  "IMMERSIVE_LEARNING",
  "PRODUCTIVITY",
  "COLLABORATION",
] as const;
export type PedTechCategory = (typeof PEDTECH_CATEGORIES)[number];

export const BENEFIT_CATEGORIES = [
  "TIME_SAVING",
  "WORKLOAD_REDUCTION",
  "STUDENT_ENGAGEMENT",
  "STUDENT_OUTCOMES",
  "ACCESSIBILITY",
  "INCLUSION",
  "COLLABORATION",
  "ORGANISATION",
  "ASSESSMENT",
  "FEEDBACK",
  "DIGITAL_WELLBEING",
  "PROFESSIONAL_PRACTICE",
  "INNOVATION",
  "LEADERSHIP",
  "COMMUNICATION",
  "PRODUCTIVITY",
] as const;
export type BenefitCategory = (typeof BENEFIT_CATEGORIES)[number];

export const BENEFIT_LABELS: Record<BenefitCategory, string> = {
  TIME_SAVING: "Time saving",
  WORKLOAD_REDUCTION: "Workload reduction",
  STUDENT_ENGAGEMENT: "Student engagement",
  STUDENT_OUTCOMES: "Student outcomes",
  ACCESSIBILITY: "Accessibility",
  INCLUSION: "Inclusion",
  COLLABORATION: "Collaboration",
  ORGANISATION: "Organisation",
  ASSESSMENT: "Assessment",
  FEEDBACK: "Feedback",
  DIGITAL_WELLBEING: "Digital wellbeing",
  PROFESSIONAL_PRACTICE: "Professional practice",
  INNOVATION: "Innovation",
  LEADERSHIP: "Leadership",
  COMMUNICATION: "Communication",
  PRODUCTIVITY: "Productivity",
};

// Level ordering + visual identity. Distinctiveness comes from icon shape +
// label + pattern, not colour alone (WCAG — don't rely on colour as the only
// differentiator).
export const LEVEL_META = {
  Navigator: {
    order: 0,
    tagline: "Finding the way",
    description:
      "Learning the essentials, finding the right tools, and gaining confidence in digital environments.",
    color: "#2563EB", // blue
    icon: "compass",
  },
  Elevator: {
    order: 1,
    tagline: "Lifting the standard",
    description:
      "Raising personal and team efficiency, deepening expertise, and optimising workflows.",
    color: "#7C3AED", // violet
    icon: "trending-up",
  },
  Catalyst: {
    order: 2,
    tagline: "Changing the game",
    description:
      "Driving innovation, shaping digital culture, and leading strategic change.",
    color: "#DB2777", // pink
    icon: "sparkles",
  },
} as const;

export type LevelName = keyof typeof LEVEL_META;

export const DEFAULT_STAGE_COMPLETION_THRESHOLD = 100; // percent, admin-configurable
export const DEFAULT_WEEKLY_TARGET = 3; // active development days/week

export const SWIPE_STATUS_MAP: Record<"left" | "up" | "right", SkillStatusValue> = {
  left: "TO_DEVELOP",
  up: "IN_PROGRESS",
  right: "MASTERED",
};

// A skill's "platform" says which suite its tool/steps are written for.
// "BOTH" means the skill is genuinely suite-agnostic (e.g. password
// hygiene, VR safety) and is shown to everyone regardless of preference.
export const PLATFORMS = ["GOOGLE", "MICROSOFT", "BOTH"] as const;
export type PlatformPreference = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<PlatformPreference, string> = {
  GOOGLE: "Google Workspace",
  MICROSOFT: "Microsoft 365",
  BOTH: "Both / not sure",
};

export const PLATFORM_SHORT_LABELS: Record<PlatformPreference, string> = {
  GOOGLE: "Google",
  MICROSOFT: "Microsoft",
  BOTH: "Both",
};

// ---------------------------------------------------------------------------
// Short-tip videos
// ---------------------------------------------------------------------------

export const VIDEO_TYPES = ["TOP_TIP", "EASY_HACK", "EXAMPLE"] as const;
export type VideoType = (typeof VIDEO_TYPES)[number];

export const VIDEO_TYPE_LABELS: Record<VideoType, string> = {
  TOP_TIP: "Top Tip",
  EASY_HACK: "Easy Hack",
  EXAMPLE: "Example",
};

export const VIDEO_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type VideoStatus = (typeof VIDEO_STATUSES)[number];

export const CAPTIONS_SOURCES = ["AI_GENERATED", "AI_EDITED", "UPLOADED_FILE", "MANUAL_TRANSCRIPT"] as const;
export type CaptionsSource = (typeof CAPTIONS_SOURCES)[number];

export const VIDEO_MAX_DURATION_SECONDS = 120;
export const VIDEO_MAX_DURATION_LABEL = "2 minutes"; // friendly phrasing kept in sync with the seconds value above — update both together
export const VIDEO_MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
export const VIDEO_ACCEPTED_MIME_TYPES = ["video/mp4", "video/quicktime"]; // .mp4, .mov
