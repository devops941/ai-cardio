// POST /api/admin/ml/activate/[version] (D18: FastAPI first, then Mongo).

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

    try {
      await ai.activateMlVersion(parsedVersion);
    } catch (err) {
      if (err instanceof AppError && err.code === "MODEL_VERSION_NOT_FOUND") {
        throw new AppError("NOT_FOUND", "Model version not found.", 404);
      }
      throw err;
    }

    await prisma.mlModelVersion.update({
      where: { id: record.id },
      data: { isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "ML_MODEL_ACTIVATED",
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
