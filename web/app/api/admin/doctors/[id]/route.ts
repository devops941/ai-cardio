// PUT/DELETE /api/admin/doctors/[id] (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { AppError, errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { doctorSchema } from "@/lib/validators";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Doctor not found.", 404);

    const body = await request.json().catch(() => null);
    const parsed = doctorSchema.partial().safeParse(body);
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

    const data: Record<string, unknown> = { ...rest };
    if (hospitalId !== undefined) data.hospitalId = hospitalId || null;
    for (const key of ["specialization", "qualification", "phone", "email", "availableDays"]) {
      if (data[key] === "") data[key] = null;
    }

    const record = await prisma.doctor.update({ where: { id }, data: data as never });
    return NextResponse.json({ doctor: record });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Doctor not found.", 404);

    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
