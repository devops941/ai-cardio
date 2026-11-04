// GET /api/admin/stats - anonymised statistics (Section 9.2).

export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const AI_BASE = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? "";

export async function GET() {
  try {
    await requireAdmin();

    const [
      users,
      predictions,
      emergencies,
      readyDocuments,
      hospitals,
      doctors,
      llmFallbackCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.prediction.count(),
      prisma.prediction.count({ where: { emergency: true } }),
      prisma.document.count({ where: { status: "READY" } }),
      prisma.hospital.count({ where: { isActive: true } }),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.prediction.count({ where: { status: "llm_unavailable" } }),
    ]);

    const grouped = await prisma.prediction.groupBy({
      by: ["finalRisk"],
      _count: { _all: true },
    });
    const riskDistribution = { LOW: 0, MODERATE: 0, HIGH: 0, UNKNOWN: 0 };
    for (const row of grouped) {
      const key = row.finalRisk ?? "UNKNOWN";
      if (key in riskDistribution) {
        riskDistribution[key as keyof typeof riskDistribution] = row._count._all;
      }
    }

    const recentFeedback = await prisma.auditLog.findMany({
      where: { action: "FEEDBACK_SUBMITTED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, createdAt: true, metadata: true },
    });

    const indexedChunks = await fetchIndexedChunks();

    return NextResponse.json({
      counts: {
        users,
        hospitals,
        doctors,
        readyDocuments,
        predictions,
        emergencies,
      },
      riskDistribution,
      indexedChunks,
      llmFallbackCount,
      recentFeedback: recentFeedback.map((log) => {
        const meta = (log.metadata ?? {}) as { rating?: number; comment?: string };
        return {
          id: log.id,
          createdAt: log.createdAt,
          rating: meta.rating ?? null,
          comment: meta.comment ?? null,
        };
      }),
    });
  } catch (err) {
    return jsonError(err);
  }
}

async function fetchIndexedChunks(): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${AI_BASE}/stats`, {
      headers: { "X-Internal-Key": INTERNAL_KEY },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const body = (await response.json()) as { indexed_chunks?: number };
    return body.indexed_chunks ?? null;
  } catch {
    return null;
  }
}
