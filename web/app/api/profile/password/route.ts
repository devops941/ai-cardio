// POST /api/profile/password (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { requireUser } from "@/lib/auth";
import { AppError, errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { passwordChangeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = passwordChangeSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));
      return errorResponse(
        "VALIDATION_FAILED",
        `${details[0]?.field ?? "request"} is invalid.`,
        422,
        details,
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!record) throw new AppError("UNAUTHORISED", "Account not found.", 401);

    const ok = await bcrypt.compare(currentPassword, record.passwordHash);
    if (!ok) {
      return errorResponse(
        "VALIDATION_FAILED",
        "Current password is incorrect.",
        422,
        [{ field: "currentPassword", issue: "incorrect" }],
      );
    }

    const same = await bcrypt.compare(newPassword, record.passwordHash);
    if (same) {
      return errorResponse(
        "VALIDATION_FAILED",
        "New password must be different from the current one.",
        422,
        [{ field: "newPassword", issue: "must differ from current password" }],
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 11);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "PASSWORD_CHANGED", entity: "User", entityId: user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
