// GET /api/admin/users (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const url = request.nextUrl;
    const q = url.searchParams.get("q")?.trim();
    const parsed = paginationSchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const { page, pageSize } = parsed.success
      ? parsed.data
      : { page: 1, pageSize: 10 };

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { predictions: true } },
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
