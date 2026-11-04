// GET /api/hospitals/[id] - hospital plus doctors, cardiologists first.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { AppError, jsonError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: { doctors: true },
    });
    if (!hospital) throw new AppError("NOT_FOUND", "Hospital not found.", 404);

    const doctors = [...hospital.doctors].sort((a, b) => {
      const aCardio = /cardiolog/i.test(a.specialization ?? "") ? 0 : 1;
      const bCardio = /cardiolog/i.test(b.specialization ?? "") ? 0 : 1;
      if (aCardio !== bCardio) return aCardio - bCardio;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ hospital: { ...hospital, doctors } });
  } catch (err) {
    return jsonError(err);
  }
}
