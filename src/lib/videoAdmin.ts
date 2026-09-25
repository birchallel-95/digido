"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { getPlaybackUrl, deleteObject } from "@/lib/storage";
import type { VideoType } from "@/lib/constants";

export interface ModerationVideo {
  id: string;
  title: string;
  description: string | null;
  type: VideoType;
  playbackUrl: string;
  captionsVtt: string | null;
  transcriptText: string | null;
  uploaderName: string;
  uploaderEmail: string;
  createdAt: string;
  skillTitles: string[];
  reportCount: number;
}

async function toModerationVideo(v: {
  id: string;
  title: string;
  description: string | null;
  type: string;
  storageKey: string;
  captionsVtt: string | null;
  transcriptText: string | null;
  createdAt: Date;
  uploader: { name: string | null; email: string };
  skillTags: { skill: { title: string } }[];
  _count: { reports: number };
}): Promise<ModerationVideo> {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    type: v.type as VideoType,
    playbackUrl: await getPlaybackUrl(v.storageKey),
    captionsVtt: v.captionsVtt,
    transcriptText: v.transcriptText,
    uploaderName: v.uploader.name ?? "Unnamed",
    uploaderEmail: v.uploader.email,
    createdAt: v.createdAt.toISOString(),
    skillTitles: v.skillTags.map((t) => t.skill.title),
    reportCount: v._count.reports,
  };
}

export async function getPendingVideos(): Promise<ModerationVideo[]> {
  await requireAdmin();
  const rows = await prisma.video.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      uploader: { select: { name: true, email: true } },
      skillTags: { include: { skill: { select: { title: true } } } },
      _count: { select: { reports: { where: { resolved: false } } } },
    },
  });
  return Promise.all(rows.map(toModerationVideo));
}

export interface ReportedVideo extends ModerationVideo {
  reports: { id: string; reporterName: string; reason: string | null; createdAt: string }[];
}

export async function getReportedVideos(): Promise<ReportedVideo[]> {
  await requireAdmin();
  const rows = await prisma.video.findMany({
    where: { reports: { some: { resolved: false } } },
    orderBy: { createdAt: "desc" },
    include: {
      uploader: { select: { name: true, email: true } },
      skillTags: { include: { skill: { select: { title: true } } } },
      _count: { select: { reports: { where: { resolved: false } } } },
      reports: {
        where: { resolved: false },
        include: { reporter: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return Promise.all(
    rows.map(async (v) => ({
      ...(await toModerationVideo(v)),
      reports: v.reports.map((r) => ({
        id: r.id,
        reporterName: r.reporter.name ?? r.reporter.email,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
      })),
    }))
  );
}

export async function approveVideo(id: string) {
  await requireAdmin();
  await prisma.video.update({ where: { id }, data: { status: "APPROVED", publishedAt: new Date(), rejectionReason: null } });
  revalidatePath("/admin/moderation");
  revalidatePath("/videos");
  return { ok: true };
}

export async function rejectVideo(id: string, reason?: string) {
  await requireAdmin();
  await prisma.video.update({ where: { id }, data: { status: "REJECTED", rejectionReason: reason?.trim() || null } });
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function adminDeleteVideo(id: string) {
  await requireAdmin();
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return { ok: false };
  await deleteObject(video.storageKey);
  await prisma.video.delete({ where: { id } });
  revalidatePath("/admin/moderation");
  revalidatePath("/videos");
  return { ok: true };
}

export async function resolveReport(reportId: string) {
  await requireAdmin();
  await prisma.videoReport.update({ where: { id: reportId }, data: { resolved: true } });
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export interface VideoAdminStats {
  totalVideos: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  reportedCount: number;
  uploadsOverTime: { date: string; count: number; cumulative: number }[];
  mostViewed: { id: string; title: string; viewCount: number; helpfulCount: number }[];
  statementsWithNoVideos: { skillId: string; skillTitle: string; areaName: string; levelName: string }[];
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getVideoAdminStats(): Promise<VideoAdminStats> {
  await requireAdmin();

  const [all, mostViewedRows, taggedSkillIds, allSkills, reportedCount] = await Promise.all([
    prisma.video.findMany({ select: { status: true, createdAt: true } }),
    prisma.video.findMany({
      where: { status: "APPROVED" },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: { id: true, title: true, viewCount: true, helpfulCount: true },
    }),
    prisma.videoSkillTag.findMany({ where: { video: { status: "APPROVED" } }, select: { skillId: true }, distinct: ["skillId"] }),
    prisma.skill.findMany({
      where: { active: true },
      select: { id: true, title: true, capabilityArea: { select: { name: true } }, level: { select: { name: true, order: true } } },
      orderBy: [{ capabilityArea: { order: "asc" } }, { level: { order: "asc" } }, { order: "asc" }],
    }),
    prisma.videoReport.count({ where: { resolved: false } }),
  ]);

  const taggedSet = new Set(taggedSkillIds.map((t) => t.skillId));
  const statementsWithNoVideos = allSkills
    .filter((s) => !taggedSet.has(s.id))
    .map((s) => ({ skillId: s.id, skillTitle: s.title, areaName: s.capabilityArea.name, levelName: s.level.name }));

  const daily = new Map<string, number>();
  for (const v of all) {
    const key = dateKey(v.createdAt);
    daily.set(key, (daily.get(key) ?? 0) + 1);
  }
  const uploadsOverTime: { date: string; count: number; cumulative: number }[] = [];
  if (all.length > 0) {
    const sorted = [...all].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const cursor = new Date(dateKey(sorted[0].createdAt) + "T00:00:00Z");
    const end = new Date(dateKey(new Date()) + "T00:00:00Z");
    let running = 0;
    while (cursor <= end) {
      const key = dateKey(cursor);
      const count = daily.get(key) ?? 0;
      running += count;
      uploadsOverTime.push({ date: key, count, cumulative: running });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return {
    totalVideos: all.length,
    pendingCount: all.filter((v) => v.status === "PENDING").length,
    approvedCount: all.filter((v) => v.status === "APPROVED").length,
    rejectedCount: all.filter((v) => v.status === "REJECTED").length,
    reportedCount,
    uploadsOverTime,
    mostViewed: mostViewedRows,
    statementsWithNoVideos,
  };
}
