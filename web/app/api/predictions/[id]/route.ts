// GET/DELETE /api/predictions/[id] - own record only (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { AppError, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const record = await prisma.prediction.findFirst({
      where: { id, userId: user.id },
    });
    if (!record) throw new AppError("NOT_FOUND", "Prediction not found.", 404);
    return NextResponse.json({ prediction: record });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const existing = await prisma.prediction.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Prediction not found.", 404);

    await prisma.prediction.delete({ where: { id } });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "PREDICTION_DELETED", entity: "Prediction", entityId: id },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
