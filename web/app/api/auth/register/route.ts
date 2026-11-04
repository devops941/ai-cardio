// POST /api/auth/register (Section 9.1).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { errorResponse, jsonError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const limit = rateLimit(`register:${ip}`, 10);
    if (!limit.allowed) {
      return errorResponse(
        "RATE_LIMITED",
        "Too many attempts. Please wait a minute and try again.",
        429,
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
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

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(
        "CONFLICT",
        "This email is already registered",
        409,
      );
    }

    const passwordHash = await bcrypt.hash(password, 11);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
        profile: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "USER_REGISTERED", entity: "User", entityId: user.id, ip },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
