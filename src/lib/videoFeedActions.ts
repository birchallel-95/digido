"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlaybackUrl } from "@/lib/storage";
import { getVideoFeed, type FeedFilter, type FeedVideo } from "@/lib/videoFeed";
import { recordView as recordViewInternal } from "@/lib/videoActions";

/** Client-callable wrapper so the feed can load more pages or re-filter without a full page navigation. */
export async function fetchVideoFeed(filter: FeedFilter, cursor?: string) {
  const session = await auth();
  return getVideoFeed(filter, session?.user?.id, cursor);
}

export async function recordVideoView(videoId: string) {
  return recordViewInternal(videoId);
}

/** Fetches a single approved video by id, for opening a shared link regardless of the viewer's current filter. */
export async function getVideoById(id: string): Promise<FeedVideo | null> {
  const session = await auth();
  const v = await prisma.video.findFirst({
    where: { id, status: "APPROVED" },
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
      helpfuls: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
  });
  if (!v) return null;

  return {
    id: v.id,
    title: v.title,
    description: v.description,
    type: v.type as FeedVideo["type"],
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
    userHasMarkedHelpful: session?.user?.id ? (v as unknown as { helpfuls: { id: string }[] }).helpfuls.length > 0 : false,
    skillTags: v.skillTags.map((t) => ({
      skillId: t.skill.id,
      skillTitle: t.skill.title,
      areaId: t.skill.capabilityArea.id,
      areaName: t.skill.capabilityArea.name,
      areaColor: t.skill.capabilityArea.color,
      levelName: t.skill.level.name,
    })),
  };
}
