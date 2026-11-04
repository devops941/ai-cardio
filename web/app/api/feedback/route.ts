// POST /api/feedback (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));
      return errorResponse("VALIDATION_FAILED", "Feedback is invalid.", 422, details);
    }

    const { rating, comment, predictionId } = parsed.data;

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "FEEDBACK_SUBMITTED",
        entity: "Feedback",
        entityId: predictionId || null,
        metadata: { rating, comment: comment || null },
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
