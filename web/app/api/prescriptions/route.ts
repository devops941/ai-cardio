// GET/POST /api/prescriptions (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { prescriptionSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.prescription.findMany({
      where: { userId: user.id },
      orderBy: { prescribedOn: "desc" },
    });
    return NextResponse.json({ items });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = prescriptionSchema.safeParse(body);
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

    const data = parsed.data;
    const record = await prisma.prescription.create({
      data: {
        userId: user.id,
        doctorName: data.doctorName,
        hospitalName: data.hospitalName || null,
        prescribedOn: data.prescribedOn ? new Date(data.prescribedOn) : new Date(),
        notes: data.notes || null,
        medicines: data.medicines,
      },
    });

    return NextResponse.json({ prescription: record }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
