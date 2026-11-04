// PUT/DELETE /api/admin/hospitals/[id] (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { AppError, errorResponse, jsonError } from "@/lib/errors";
import { withLocation } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import { hospitalSchema } from "@/lib/validators";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const existing = await prisma.hospital.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Hospital not found.", 404);

    const body = await request.json().catch(() => null);
    const parsed = hospitalSchema.partial().safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));
      return errorResponse("VALIDATION_FAILED", "Hospital is invalid.", 422, details);
    }

    const data = withLocation({ ...parsed.data } as Record<string, unknown>);
    for (const key of ["address", "city", "state", "pincode", "phone"]) {
      if (data[key] === "") data[key] = null;
    }

    const record = await prisma.hospital.update({ where: { id }, data: data as never });
    return NextResponse.json({ hospital: record });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const existing = await prisma.hospital.findUnique({ where: { id } });
    if (!existing) throw new AppError("NOT_FOUND", "Hospital not found.", 404);

    await prisma.$transaction([
      prisma.doctor.deleteMany({ where: { hospitalId: id } }),
      prisma.hospital.delete({ where: { id } }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "HOSPITAL_DELETED",
        entity: "Hospital",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
