// POST /api/admin/ml/train (Section 9.2, D17).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import * as ai from "@/lib/ai-client";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/errors";
import { validateFileMeta, validateFileSignature } from "@/lib/file-validate";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    let upload: File | undefined;
    if (file instanceof File && file.size > 0) {
      validateFileMeta(file.name, file.size, { tabularOnly: true });
      await validateFileSignature(file);
      upload = file;
    }

    const trained = await ai.trainModel(upload);

    const record = await prisma.mlModelVersion.upsert({
      where: { version: trained.version },
      create: {
        version: trained.version,
        algorithm: trained.algorithm,
        accuracy: trained.metrics?.accuracy ?? null,
        precision: trained.metrics?.precision ?? null,
        recall: trained.metrics?.recall ?? null,
        f1: trained.metrics?.f1 ?? null,
        rocAuc: trained.metrics?.roc_auc ?? null,
        filePath: trained.file_path ?? null,
        metrics: ai.normaliseMlMetrics(trained) as never,
        isActive: false,
      },
      update: {
        algorithm: trained.algorithm,
        accuracy: trained.metrics?.accuracy ?? null,
        precision: trained.metrics?.precision ?? null,
        recall: trained.metrics?.recall ?? null,
        f1: trained.metrics?.f1 ?? null,
        rocAuc: trained.metrics?.roc_auc ?? null,
        filePath: trained.file_path ?? null,
        metrics: ai.normaliseMlMetrics(trained) as never,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "ML_MODEL_TRAINED",
        entity: "MlModelVersion",
        entityId: record.id,
        metadata: { version: trained.version },
      },
    });

    return NextResponse.json({ model: record }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
