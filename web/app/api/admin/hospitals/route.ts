// GET/POST /api/admin/hospitals (Section 9.2).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { errorResponse, jsonError } from "@/lib/errors";
import { withLocation } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import { hospitalSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const q = request.nextUrl.searchParams.get("q")?.trim();
    const items = await prisma.hospital.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { pincode: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      take: 200,
    });
    return NextResponse.json({ items });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = hospitalSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        issue: issue.message,
      }));
      return errorResponse("VALIDATION_FAILED", "Hospital is invalid.", 422, details);
    }

    const data = withLocation({ ...parsed.data } as Record<string, unknown>);
    for (const key of ["address", "city", "state", "pincode", "phone"]) {
      if (data[key] === "") data[key] = null;
    }
    const record = await prisma.hospital.create({ data: data as never });
    return NextResponse.json({ hospital: record }, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
