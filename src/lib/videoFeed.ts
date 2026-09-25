import { prisma } from "@/lib/prisma";
import { getPlaybackUrl } from "@/lib/storage";
import type { VideoType } from "@/lib/constants";

export interface FeedFilter {
  skillId?: string;
  levelId?: string;
  areaId?: string;
  type?: VideoType;
  sort?: "newest" | "helpful";
}

export interface FeedSkillTag {
  skillId: string;
  skillTitle: string;
  areaId: string;
  areaName: string;
  areaColor: string;
  levelName: string;
}

export interface FeedVideo {
  id: string;
  title: string;
  description: string | null;
  type: VideoType;
  playbackUrl: string;
  width: number | null;
  height: number | null;
  captionsVtt: string | null;
  transcriptText: string | null;
  helpfulCount: number;
  viewCount: number;
  createdAt: string;
  uploaderName: string;
  uploaderId: string;
  userHasMarkedHelpful: boolean;
  skillTags: FeedSkillTag[];
}

const PAGE_SIZE = 15;

export async function getVideoFeed(
  filter: FeedFilter,
  currentUserId: string | undefined,
  cursor?: string
): Promise<{ videos: FeedVideo[]; nextCursor: string | null }> {
  const where = {
    status: "APPROVED" as const,
    ...(filter.type ? { type: filter.type } : {}),
    ...(filter.skillId || filter.levelId || filter.areaId
      ? {
          skillTags: {
            some: {
              ...(filter.skillId ? { skillId: filter.skillId } : {}),
              skill: {
                ...(filter.levelId ? { levelId: filter.levelId } : {}),
                ...(filter.areaId ? { capabilityAreaId: filter.areaId } : {}),
              },
            },
          },
        }
      : {}),
  };

  const rows = await prisma.video.findMany({
    where,
    orderBy: filter.sort === "helpful" ? [{ helpfulCount: "desc" }, { createdAt: "desc" }] : { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      uploader: { select: { id: true, name: true } },
      skillTags: {
        include: {
          skill: {
            select: {
              id: true,
              title: true,
              level: { select: { name: true } },
              capabilityArea: { select: { id: true, name: true, color: true } },
            },
          },
        },
      },
      helpfuls: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
    },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  const videos: FeedVideo[] = await Promise.all(
    page.map(async (v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      type: v.type as VideoType,
      playbackUrl: await getPlaybackUrl(v.storageKey),
      width: v.width,
      height: v.height,
      captionsVtt: v.captionsVtt,
      transcriptText: v.transcriptText,
      helpfulCount: v.helpfulCount,
      viewCount: v.viewCount,
      createdAt: v.createdAt.toISOString(),
      uploaderName: v.uploader.name ?? "Someone",
      uploaderId: v.uploader.id,
      userHasMarkedHelpful: currentUserId ? (v as { helpfuls: { id: string }[] }).helpfuls.length > 0 : false,
      skillTags: v.skillTags.map((t) => ({
        skillId: t.skill.id,
        skillTitle: t.skill.title,
        areaId: t.skill.capabilityArea.id,
        areaName: t.skill.capabilityArea.name,
        areaColor: t.skill.capabilityArea.color,
        levelName: t.skill.level.name,
      })),
    }))
  );

  return { videos, nextCursor: hasMore ? page[page.length - 1].id : null };
}

/** Approved-video counts per skill, for the flashcard's "Watch tips (n)" button. */
export async function getVideoCountsBySkill(): Promise<Map<string, number>> {
  const rows = await prisma.videoSkillTag.findMany({
    where: { video: { status: "APPROVED" } },
    select: { skillId: true },
  });
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.skillId, (counts.get(r.skillId) ?? 0) + 1);
  return counts;
}

export async function getVideoCountForSkill(skillId: string): Promise<number> {
  return prisma.video.count({ where: { status: "APPROVED", skillTags: { some: { skillId } } } });
}
