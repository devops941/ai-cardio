// POST /api/admin/ml/deactivate/[version] (ensemble support: D18).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import * as ai from "@/lib/ai-client";
import { requireAdmin } from "@/lib/auth";
import { AppError, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ version: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { version } = await params;
    const parsedVersion = Number(version);
    if (!Number.isInteger(parsedVersion)) {
      throw new AppError("VALIDATION_FAILED", "Invalid model version.", 422);
    }

    const record = await prisma.mlModelVersion.findUnique({
      where: { version: parsedVersion },
    });
    if (!record) throw new AppError("NOT_FOUND", "Model version not found.", 404);

    // Guard: refuse if this is the last active model.
    const activeCount = await prisma.mlModelVersion.count({
      where: { isActive: true },
    });
    if (activeCount <= 1 && record.isActive) {
      throw new AppError(
        "LAST_ACTIVE_MODEL",
        "At least one model must remain active.",
        409,
      );
    }

    try {
      await ai.deactivateMlVersion(parsedVersion);
    } catch (err) {
      if (err instanceof AppError && err.code === "MODEL_VERSION_NOT_FOUND") {
        throw new AppError("NOT_FOUND", "Model version not found.", 404);
      }
      // Map FastAPI LAST_ACTIVE_MODEL to 409 as well.
      if (err instanceof AppError && err.code === "LAST_ACTIVE_MODEL") {
        throw new AppError(
          "LAST_ACTIVE_MODEL",
          "At least one model must remain active.",
          409,
        );
      }
      throw err;
    }

    await prisma.mlModelVersion.update({
      where: { id: record.id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "ML_MODEL_DEACTIVATED",
        entity: "MlModelVersion",
        entityId: record.id,
        metadata: { version: parsedVersion },
      },
    });

    const activeRecords = await prisma.mlModelVersion.findMany({
      where: { isActive: true },
      select: { version: true },
      orderBy: { version: "asc" },
    });
    const activeVersions = activeRecords.map((r) => r.version);

    return NextResponse.json({ activeVersions });
  } catch (err) {
    return jsonError(err);
  }
}
