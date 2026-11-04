// GET/POST /api/admin/doctors (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { AppError, errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { doctorSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const q = request.nextUrl.searchParams.get("q")?.trim();
    const items = await prisma.doctor.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { specialization: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      take: 200,
      include: { hospital: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ items });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = doctorSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));
      return errorResponse("VALIDATION_FAILED", "Doctor is invalid.", 422, details);
    }

    const { hospitalId, ...rest } = parsed.data;
    if (hospitalId) {
      const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
      if (!hospital) {
        throw new AppError("VALIDATION_FAILED", "Hospital not found.", 422, [
          { field: "hospitalId", issue: "hospital not found" },
        ]);
      }
    }

    const data: Record<string, unknown> = { ...rest, hospitalId: hospitalId || null };
    for (const key of ["specialization", "qualification", "phone", "email", "availableDays"]) {
      if (data[key] === "") data[key] = null;
    }

    const record = await prisma.doctor.create({ data: data as never });
    return NextResponse.json({ doctor: record }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
