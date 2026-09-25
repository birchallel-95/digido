"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { toggleHelpful, reportVideo, type TagPickerArea } from "@/lib/videoActions";
import { fetchVideoFeed, recordVideoView, getVideoById } from "@/lib/videoFeedActions";
import type { FeedVideo, FeedFilter } from "@/lib/videoFeed";
import { VIDEO_TYPE_LABELS, VIDEO_TYPES, type VideoType } from "@/lib/constants";

const SOUND_KEY = "digido-video-sound-on";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function VideoFeedClient({
  initialVideos,
  initialCursor,
  initialFilter,
  tagOptions,
}: {
  initialVideos: FeedVideo[];
  initialCursor: string | null;
  initialFilter: FeedFilter;
  tagOptions: TagPickerArea[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState(initialVideos);
  const [cursor, setCursor] = useState(initialCursor);
  const [filter, setFilter] = useState<FeedFilter>(initialFilter);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [infoIndex, setInfoIndex] = useState<number | null>(null);
  const [reportIndex, setReportIndex] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [shareCopiedId, setShareCopiedId] = useState<string | null>(null);
  const [helpfulState, setHelpfulState] = useState<Record<string, { count: number; mine: boolean }>>(() =>
    Object.fromEntries(initialVideos.map((v) => [v.id, { count: v.helpfulCount, mine: v.userHasMarkedHelpful }]))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const viewedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // One-time read of a browser-only API on mount — sessionStorage isn't
    // available during SSR, so this can't be a lazy useState initializer.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSoundOn(sessionStorage.getItem(SOUND_KEY) === "1");
    } catch {}
  }, []);

  // Deep-link support: /videos?v=<id> from a shared link, regardless of the current filter/page.
  useEffect(() => {
    const sharedId = searchParams.get("v");
    if (!sharedId) return;
    if (videos.some((v) => v.id === sharedId)) return;
    getVideoById(sharedId).then((v) => {
      if (v) {
        setVideos((prev) => [v, ...prev.filter((x) => x.id !== v.id)]);
        setHelpfulState((prev) => ({ ...prev, [v.id]: { count: v.helpfulCount, mine: v.userHasMarkedHelpful } }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const registerItemRef = useCallback((index: number, el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  }, []);
  const registerVideoRef = useCallback((index: number, el: HTMLVideoElement | null) => {
    videoRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: [0.6] }
    );
    Object.values(itemRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [videos.length]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idxStr, el]) => {
      if (!el) return;
      const idx = Number(idxStr);
      if (idx === activeIndex) {
        el.muted = !soundOn;
        el.play().catch(() => {});
        const id = videos[idx]?.id;
        if (id && !viewedIds.current.has(id)) {
          viewedIds.current.add(id);
          recordVideoView(id);
        }
      } else {
        el.pause();
      }
    });
  }, [activeIndex, soundOn, videos]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((el) => {
      if (!el) return;
      const track = el.textTracks[0];
      if (track) track.mode = captionsOn ? "showing" : "hidden";
    });
  }, [captionsOn, videos]);

  // Preload the next one/two videos so swiping feels instant.
  useEffect(() => {
    if (!cursor || loadingMore) return;
    if (activeIndex >= videos.length - 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-more-on-scroll is a standard data-fetching effect
      setLoadingMore(true);
      fetchVideoFeed(filter, cursor).then(({ videos: more, nextCursor }) => {
        setVideos((prev) => [...prev, ...more]);
        setHelpfulState((prev) => ({
          ...prev,
          ...Object.fromEntries(more.map((v) => [v.id, { count: v.helpfulCount, mine: v.userHasMarkedHelpful }])),
        }));
        setCursor(nextCursor);
        setLoadingMore(false);
      });
    }
  }, [activeIndex, cursor, loadingMore, filter, videos.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (filterOpen || infoIndex !== null || reportIndex !== null) return;
      const container = containerRef.current;
      if (!container) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        container.scrollBy({ top: container.clientHeight, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        container.scrollBy({ top: -container.clientHeight, behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen, infoIndex, reportIndex]);

  function toggleSound() {
    setSoundOn((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(SOUND_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  function handleTap(index: number) {
    const el = videoRefs.current[index];
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
  }

  async function handleHelpful(id: string) {
    setHelpfulState((prev) => {
      const cur = prev[id] ?? { count: 0, mine: false };
      return { ...prev, [id]: { count: cur.mine ? cur.count - 1 : cur.count + 1, mine: !cur.mine } };
    });
    await toggleHelpful(id);
  }

  async function handleShare(video: FeedVideo) {
    const url = `${window.location.origin}/videos?v=${video.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopiedId(video.id);
      setTimeout(() => setShareCopiedId((cur) => (cur === video.id ? null : cur)), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  async function submitReport() {
    if (reportIndex === null) return;
    await reportVideo(videos[reportIndex].id, reportReason);
    setReportSent(true);
    setTimeout(() => {
      setReportIndex(null);
      setReportSent(false);
      setReportReason("");
    }, 1500);
  }

  async function applyFilter(next: FeedFilter) {
    setFilterOpen(false);
    setFilter(next);
    setLoadingMore(true);
    const { videos: fresh, nextCursor } = await fetchVideoFeed(next);
    setVideos(fresh);
    setHelpfulState(Object.fromEntries(fresh.map((v) => [v.id, { count: v.helpfulCount, mine: v.userHasMarkedHelpful }])));
    setCursor(nextCursor);
    setActiveIndex(0);
    setLoadingMore(false);
    containerRef.current?.scrollTo({ top: 0 });

    const qp = new URLSearchParams();
    if (next.areaId) qp.set("areaId", next.areaId);
    if (next.levelId) qp.set("levelId", next.levelId);
    if (next.skillId) qp.set("skillId", next.skillId);
    if (next.type) qp.set("type", next.type);
    if (next.sort && next.sort !== "newest") qp.set("sort", next.sort);
    router.replace(`/videos${qp.toString() ? `?${qp}` : ""}`, { scroll: false });
  }

  const activeFilterCount = [filter.areaId, filter.levelId, filter.skillId, filter.type].filter(Boolean).length;

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--color-ink)] flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <Icon name="video" className="h-10 w-10 mx-auto text-white/40 mb-3" />
          <p className="text-white font-semibold mb-1">No tips here yet</p>
          <p className="text-white/60 text-sm mb-5">Be the first to share one!</p>
          <div className="flex justify-center gap-3">
            <Link href={filter.skillId ? `/videos/upload?skillId=${filter.skillId}` : "/videos/upload"}>
              <Button>Add a video</Button>
            </Link>
            {activeFilterCount > 0 && (
              <Button variant="outline" className="!bg-white/10 !border-white/20 !text-white" onClick={() => applyFilter({ sort: "newest" })}>
                Clear filters
              </Button>
            )}
            <Link href="/dashboard">
              <Button variant="outline" className="!bg-white/10 !border-white/20 !text-white">
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="mx-auto h-full max-w-[480px] relative">
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((video, index) => (
            <FeedVideoItem
              key={video.id}
              video={video}
              index={index}
              isActive={index === activeIndex}
              soundOn={soundOn}
              captionsOn={captionsOn}
              helpful={helpfulState[video.id] ?? { count: video.helpfulCount, mine: video.userHasMarkedHelpful }}
              shareCopied={shareCopiedId === video.id}
              registerItemRef={registerItemRef}
              registerVideoRef={registerVideoRef}
              onTap={() => handleTap(index)}
              onHelpful={() => handleHelpful(video.id)}
              onShare={() => handleShare(video)}
              onReport={() => setReportIndex(index)}
              onInfo={() => setInfoIndex(index)}
            />
          ))}
        </div>

        <div
          className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pointer-events-none"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        >
          <Link
            href="/dashboard"
            aria-label="Close video tips"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <Icon name="x" className="h-5 w-5" />
          </Link>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setCaptionsOn((c) => !c)}
              aria-pressed={captionsOn}
              aria-label={captionsOn ? "Turn off captions" : "Turn on captions"}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${captionsOn ? "bg-[var(--color-brand)] text-[var(--color-ink)]" : "bg-black/40"}`}
            >
              <Icon name="captions" className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute" : "Unmute"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
            >
              <Icon name={soundOn ? "volume-on" : "volume-off"} className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="Filter videos"
              className="pointer-events-auto flex items-center gap-1.5 h-9 rounded-full bg-black/40 text-white px-3.5 text-sm font-medium"
            >
              <Icon name="filter" className="h-4 w-4" />
              {activeFilterCount > 0 ? activeFilterCount : ""}
            </button>
          </div>
        </div>
      </div>

      {filterOpen && (
        <FilterSheet
          tagOptions={tagOptions}
          current={filter}
          onApply={applyFilter}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {infoIndex !== null && <InfoSheet video={videos[infoIndex]} onClose={() => setInfoIndex(null)} />}

      {reportIndex !== null && (
        <ReportSheet
          reason={reportReason}
          setReason={setReportReason}
          sent={reportSent}
          onCancel={() => {
            setReportIndex(null);
            setReportReason("");
          }}
          onSubmit={submitReport}
        />
      )}
    </div>
  );
}

function FeedVideoItem({
  video,
  index,
  isActive,
  soundOn,
  captionsOn,
  helpful,
  shareCopied,
  registerItemRef,
  registerVideoRef,
  onTap,
  onHelpful,
  onShare,
  onReport,
  onInfo,
}: {
  video: FeedVideo;
  index: number;
  isActive: boolean;
  soundOn: boolean;
  captionsOn: boolean;
  helpful: { count: number; mine: boolean };
  shareCopied: boolean;
  registerItemRef: (i: number, el: HTMLDivElement | null) => void;
  registerVideoRef: (i: number, el: HTMLVideoElement | null) => void;
  onTap: () => void;
  onHelpful: () => void;
  onShare: () => void;
  onReport: () => void;
  onInfo: () => void;
}) {
  const vttUrl = useMemo(() => {
    if (!video.captionsVtt) return null;
    const blob = new Blob([video.captionsVtt], { type: "text/vtt" });
    return URL.createObjectURL(blob);
  }, [video.captionsVtt]);
  useEffect(() => () => { if (vttUrl) URL.revokeObjectURL(vttUrl); }, [vttUrl]);

  const isPortrait = !video.width || !video.height || video.height >= video.width;

  return (
    <div
      ref={(el) => registerItemRef(index, el)}
      data-index={index}
      className="relative h-full w-full snap-start snap-always flex items-center justify-center bg-black overflow-hidden"
    >
      <video
        ref={(el) => registerVideoRef(index, el)}
        src={video.playbackUrl}
        className={isPortrait ? "h-full w-full object-cover" : "w-full h-auto max-h-full object-contain"}
        loop
        playsInline
        muted={!soundOn}
        preload={isActive ? "auto" : "metadata"}
        onClick={onTap}
        onLoadedMetadata={(e) => {
          const track = e.currentTarget.textTracks[0];
          if (track) track.mode = captionsOn ? "showing" : "hidden";
        }}
        aria-label={`${video.title} by ${video.uploaderName}. Tap to play or pause.`}
      >
        {vttUrl && <track kind="captions" src={vttUrl} srcLang="en" label="English" default />}
      </video>

      <div
        className="absolute bottom-0 inset-x-0 z-10 px-4 pt-10 text-white bg-gradient-to-t from-black/75 via-black/30 to-transparent"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">{VIDEO_TYPE_LABELS[video.type]}</span>
          <span className="text-xs text-white/70">{video.uploaderName} · {formatDate(video.createdAt)}</span>
        </div>
        <p className="text-sm font-medium mb-2 pr-14">{video.title}</p>
        <div className="flex flex-wrap gap-1.5">
          {video.skillTags.map((t) => (
            <Link
              key={t.skillId}
              href={`/discover/${t.areaId}?level=${t.levelName}&skill=${t.skillId}`}
              className="inline-flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 rounded-full pl-1.5 pr-2.5 py-1"
            >
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: t.areaColor }} aria-hidden />
              {t.skillTitle}
            </Link>
          ))}
        </div>
      </div>

      <div
        className="absolute right-3 z-10 flex flex-col items-center gap-5 text-white"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 7.5rem)" }}
      >
        <button onClick={onHelpful} aria-pressed={helpful.mine} aria-label={helpful.mine ? "Remove helpful mark" : "Mark as helpful"} className="flex flex-col items-center gap-1">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${helpful.mine ? "bg-[var(--color-brand)] text-[var(--color-ink)]" : "bg-black/40"}`}>
            <Icon name="thumbs-up" className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium tabular-nums">{helpful.count}</span>
        </button>
        <button onClick={onShare} aria-label="Copy share link" className="flex flex-col items-center gap-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <Icon name="share" className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium">{shareCopied ? "Copied!" : "Share"}</span>
        </button>
        <button onClick={onReport} aria-label="Report this video" className="flex flex-col items-center gap-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <Icon name="flag" className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium">Report</span>
        </button>
        <button onClick={onInfo} aria-label="Show description and transcript" className="flex flex-col items-center gap-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <Icon name="info" className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium">Info</span>
        </button>
      </div>
    </div>
  );
}

function InfoSheet({ video, onClose }: { video: FeedVideo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Video details"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[var(--color-surface-raised)] rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-3">
          <h2 className="font-display font-bold text-[var(--color-ink)]">{video.title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-[var(--color-ink-faint)]">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        {video.description && <p className="text-sm text-[var(--color-ink-muted)] mb-4">{video.description}</p>}
        {video.transcriptText && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)] mb-1.5">Transcript</p>
            <p className="text-sm text-[var(--color-ink-muted)] whitespace-pre-wrap">{video.transcriptText}</p>
          </div>
        )}
        {!video.description && !video.transcriptText && (
          <p className="text-sm text-[var(--color-ink-faint)]">No extra description for this one.</p>
        )}
      </div>
    </div>
  );
}

function ReportSheet({
  reason,
  setReason,
  sent,
  onCancel,
  onSubmit,
}: {
  reason: string;
  setReason: (v: string) => void;
  sent: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div
        role="dialog"
        aria-label="Report video"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[var(--color-surface-raised)] rounded-t-3xl sm:rounded-3xl p-6"
      >
        {sent ? (
          <p className="text-sm font-medium text-[var(--color-success)] text-center py-4">Thanks — an admin will take a look.</p>
        ) : (
          <>
            <h2 className="font-display font-bold text-[var(--color-ink)] mb-3">Report this video</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="What's wrong with it? (optional)"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm mb-4"
            />
            <div className="flex justify-end gap-2.5">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onSubmit}>
                Report
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterSheet({
  tagOptions,
  current,
  onApply,
  onClose,
}: {
  tagOptions: TagPickerArea[];
  current: FeedFilter;
  onApply: (f: FeedFilter) => void;
  onClose: () => void;
}) {
  const [areaId, setAreaId] = useState(current.areaId ?? "");
  const [levelId, setLevelId] = useState(current.levelId ?? "");
  const [skillId, setSkillId] = useState(current.skillId ?? "");
  const [type, setType] = useState<VideoType | "">(current.type ?? "");
  const [sort, setSort] = useState<"newest" | "helpful">(current.sort ?? "newest");

  const area = tagOptions.find((a) => a.id === areaId);
  const level = area?.levels.find((l) => l.id === levelId);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Filter and sort videos"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[var(--color-surface-raised)] rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[var(--color-ink)]">Filter & sort</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-[var(--color-ink-faint)]">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Sort by</p>
            <div className="grid grid-cols-2 gap-2">
              {(["newest", "helpful"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`rounded-xl border py-2 text-sm font-medium ${sort === s ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-text)]" : "border-[var(--color-border)] text-[var(--color-ink-muted)]"}`}
                >
                  {s === "newest" ? "Newest" : "Most helpful"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Type</p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setType("")}
                className={`rounded-xl border py-2 text-xs font-medium ${type === "" ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-text)]" : "border-[var(--color-border)] text-[var(--color-ink-muted)]"}`}
              >
                All
              </button>
              {VIDEO_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-xl border py-2 text-xs font-medium ${type === t ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-text)]" : "border-[var(--color-border)] text-[var(--color-ink-muted)]"}`}
                >
                  {VIDEO_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="filter-area" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
              Jisc element
            </label>
            <select
              id="filter-area"
              value={areaId}
              onChange={(e) => {
                setAreaId(e.target.value);
                setLevelId("");
                setSkillId("");
              }}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm"
            >
              <option value="">All elements</option>
              {tagOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {area && (
            <div>
              <label htmlFor="filter-level" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                Tier
              </label>
              <select
                id="filter-level"
                value={levelId}
                onChange={(e) => {
                  setLevelId(e.target.value);
                  setSkillId("");
                }}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm"
              >
                <option value="">All tiers</option>
                {area.levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {level && (
            <div>
              <label htmlFor="filter-skill" className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
                Statement
              </label>
              <select
                id="filter-skill"
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm"
              >
                <option value="">All statements</option>
                {level.skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-2.5 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setAreaId("");
              setLevelId("");
              setSkillId("");
              setType("");
              setSort("newest");
              onApply({ sort: "newest" });
            }}
          >
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={() =>
              onApply({
                areaId: areaId || undefined,
                levelId: levelId || undefined,
                skillId: skillId || undefined,
                type: type || undefined,
                sort,
              })
            }
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
