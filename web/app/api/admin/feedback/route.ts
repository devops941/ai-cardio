// GET /api/admin/feedback (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const ratingParam = request.nextUrl.searchParams.get("rating");
    const rating = ratingParam ? Number(ratingParam) : null;

    const logs = await prisma.auditLog.findMany({
      where: { action: "FEEDBACK_SUBMITTED" },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        createdAt: true,
        entityId: true,
        metadata: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const items = logs
      .map((log) => {
        const meta = (log.metadata ?? {}) as { rating?: number; comment?: string };
        return {
          id: log.id,
          createdAt: log.createdAt,
          predictionId: log.entityId,
          rating: meta.rating ?? null,
          comment: meta.comment ?? null,
          user: log.user,
        };
      })
      .filter((item) => (rating ? item.rating === rating : true));

    return NextResponse.json({ items });
  } catch (err) {
    return jsonError(err);
  }
}
