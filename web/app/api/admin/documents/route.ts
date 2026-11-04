// GET/POST /api/admin/documents (Section 9.2, 9.7, D15).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import * as ai from "@/lib/ai-client";
import { requireAdmin } from "@/lib/auth";
import { AppError, errorResponse, jsonError } from "@/lib/errors";
import {
  checksumOf,
  validateFileMeta,
  validateFileSignature,
} from "@/lib/file-validate";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const STUCK_AFTER_MS = 10 * 60 * 1000;

export async function GET() {
  try {
    await requireAdmin();
    await sweepStuckJobs();

    const items = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ items });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const limit = rateLimit(`ingest:${admin.id}`, 10);
    if (!limit.allowed) {
      return errorResponse("RATE_LIMITED", "Too many uploads. Please wait.", 429);
    }

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_FAILED", "A file is required.", 422);
    }

    validateFileMeta(file.name, file.size);
    await validateFileSignature(file);

    const checksum = await checksumOf(file);
    const duplicate = await prisma.document.findUnique({ where: { checksum } });
    if (duplicate) {
      throw new AppError("CONFLICT", "This file has already been uploaded.", 409);
    }

    const record = await prisma.document.create({
      data: {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        checksum,
        status: "PROCESSING",
        uploadedById: admin.id,
      },
      select: { id: true },
    });

    // Background ingestion: the file lives in memory only for this call.
    void ingestInBackground(record.id, file);

    return NextResponse.json({ documentId: record.id, status: "PROCESSING" }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}

async function ingestInBackground(documentId: string, file: File) {
  try {
    const result = await ai.ingestDocument(file, documentId);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "READY",
        chunkCount: result.chunks,
        ingestedAt: new Date(),
        errorMessage: null,
      },
    });
  } catch (err) {
    const message =
      err instanceof AppError ? `${err.code}: ${err.message}` : "Ingestion failed.";
    await prisma.document
      .update({
        where: { id: documentId },
        data: { status: "FAILED", errorMessage: message },
      })
      .catch(() => undefined);
  }
}

async function sweepStuckJobs() {
  const cutoff = new Date(Date.now() - STUCK_AFTER_MS);
  await prisma.document.updateMany({
    where: { status: "PROCESSING", createdAt: { lt: cutoff } },
    data: {
      status: "FAILED",
      errorMessage: "Ingestion timed out; the background job did not finish.",
    },
  });
}
