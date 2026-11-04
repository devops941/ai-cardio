// GET/PUT /api/profile (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });
    return NextResponse.json({ user: record });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = profileUpdateSchema.safeParse(body);
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

    const { name, ...profileFields } = parsed.data;

    if (name) {
      await prisma.user.update({ where: { id: user.id }, data: { name } });
    }

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(profileFields)) {
      if (value === undefined) continue;
      data[key] = value === "" ? null : value;
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return NextResponse.json({ profile });
  } catch (err) {
    return jsonError(err);
  }
}
