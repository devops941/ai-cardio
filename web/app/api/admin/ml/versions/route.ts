// GET /api/admin/ml/versions - sync from FastAPI then list (D18).

export const runtime = "nodejs";

import { NextResponse } from "next/server";

import * as ai from "@/lib/ai-client";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    let remote: ai.MlVersion[] = [];
    let aiReachable = true;
    try {
      const response = await ai.listMlVersions();
      remote = response.versions;
    } catch {
      aiReachable = false;
    }

    if (remote.length > 0) {
      for (const version of remote) {
        await prisma.mlModelVersion.upsert({
          where: { version: version.version },
          create: {
            version: version.version,
            algorithm: version.algorithm,
            accuracy: version.metrics?.accuracy ?? null,
            precision: version.metrics?.precision ?? null,
            recall: version.metrics?.recall ?? null,
            f1: version.metrics?.f1 ?? null,
            rocAuc: version.metrics?.roc_auc ?? null,
            filePath: version.file_path ?? null,
            metrics: ai.normaliseMlMetrics(version) as never,
            isActive: false,
          },
          update: {
            algorithm: version.algorithm,
            accuracy: version.metrics?.accuracy ?? null,
            precision: version.metrics?.precision ?? null,
            recall: version.metrics?.recall ?? null,
            f1: version.metrics?.f1 ?? null,
            rocAuc: version.metrics?.roc_auc ?? null,
            filePath: version.file_path ?? null,
            metrics: ai.normaliseMlMetrics(version) as never,
          },
        });
      }
    }

    const existingActive = await prisma.mlModelVersion.findFirst({
      where: { isActive: true },
    });

    if (!existingActive) {
      const first = await prisma.mlModelVersion.findFirst({
        orderBy: { version: "asc" },
      });
      if (first) {
        try {
          await ai.activateMlVersion(first.version);
        } catch {
          // FastAPI may be offline; still record the intended active model.
        }
        await prisma.mlModelVersion.update({
          where: { id: first.id },
          data: { isActive: true },
        });
      }
    }

    const versions = await prisma.mlModelVersion.findMany({
      orderBy: { version: "desc" },
    });
    const active = versions.find((v) => v.isActive) ?? null;

    return NextResponse.json({
      versions,
      activeVersion: active?.version ?? null,
      aiReachable,
    });
  } catch (err) {
    return jsonError(err);
  }
}
