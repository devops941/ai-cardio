// DELETE /api/admin/documents/[id] (D16: vectors first, then Mongo).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import * as ai from "@/lib/ai-client";
import { requireAdmin } from "@/lib/auth";
import { AppError, errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const record = await prisma.document.findUnique({ where: { id } });
    if (!record) throw new AppError("NOT_FOUND", "Document not found.", 404);

    try {
      await ai.deleteDocument(id);
    } catch (err) {
      if (err instanceof AppError && err.status === 404) {
        // Vectors already gone; safe to continue.
      } else {
        return errorResponse(
          "AI_SERVICE_UNAVAILABLE",
          "Could not remove the document vectors. The record was kept.",
          502,
        );
      }
    }

    await prisma.document.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "DOCUMENT_DELETED",
        entity: "Document",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
