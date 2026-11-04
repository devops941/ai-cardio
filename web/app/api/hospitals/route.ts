// GET /api/hospitals - browse by city/pincode with filters (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const url = request.nextUrl;
    const city = url.searchParams.get("city")?.trim();
    const pincode = url.searchParams.get("pincode")?.trim();
    const cardiology = url.searchParams.get("cardiology") === "true";
    const emergency = url.searchParams.get("emergency") === "true";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20)));

    if (!city && !pincode) {
      return errorResponse(
        "VALIDATION_FAILED",
        "Provide a city or pincode to search.",
        422,
        [{ field: "city", issue: "city or pincode is required" }],
      );
    }

    const where = {
      isActive: true,
      ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
      ...(pincode ? { pincode } : {}),
      ...(cardiology ? { hasCardiology: true } : {}),
      ...(emergency ? { emergency24x7: true } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.hospital.count({ where }),
      prisma.hospital.findMany({
        where,
        orderBy: { rating: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          doctors: { select: { id: true, name: true, specialization: true } },
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
