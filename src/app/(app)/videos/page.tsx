import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { getVideoFeed } from "@/lib/videoFeed";
import { getVideoTagOptions } from "@/lib/videoActions";
import { VideoFeedClient } from "@/components/videos/VideoFeedClient";
import type { VideoType } from "@/lib/constants";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ skillId?: string; levelId?: string; areaId?: string; type?: string; sort?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const filter = {
    skillId: params.skillId,
    levelId: params.levelId,
    areaId: params.areaId,
    type: params.type as VideoType | undefined,
    sort: params.sort === "helpful" ? ("helpful" as const) : ("newest" as const),
  };

  const [{ videos, nextCursor }, tagOptions] = await Promise.all([
    getVideoFeed(filter, user.id),
    getVideoTagOptions(),
  ]);

  return (
    <Suspense>
      <VideoFeedClient
        initialVideos={videos}
        initialCursor={nextCursor}
        initialFilter={filter}
        tagOptions={tagOptions}
      />
    </Suspense>
  );
}
