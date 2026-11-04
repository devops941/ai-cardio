// GET /api/predictions - own history, newest first (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const url = request.nextUrl;
    const parsed = paginationSchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    if (!parsed.success) {
      return errorResponse("VALIDATION_FAILED", "Invalid pagination.", 422);
    }
    const { page, pageSize } = parsed.data;

    const [total, items] = await Promise.all([
      prisma.prediction.count({ where: { userId: user.id } }),
      prisma.prediction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          createdAt: true,
          finalRisk: true,
          emergency: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (err) {
    return jsonError(err);
  }
}
