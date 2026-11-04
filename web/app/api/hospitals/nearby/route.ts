// GET /api/hospitals/nearby (Section 9.2, 9.5).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError } from "@/lib/errors";
import { findRankedHospitals } from "@/lib/hospitals";
import { nearbySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const url = request.nextUrl;
    const parsed = nearbySchema.safeParse({
      lat: url.searchParams.get("lat") ?? undefined,
      lng: url.searchParams.get("lng") ?? undefined,
      city: url.searchParams.get("city") ?? undefined,
      pincode: url.searchParams.get("pincode") ?? undefined,
      radiusKm: url.searchParams.get("radiusKm") ?? undefined,
      risk: url.searchParams.get("risk") ?? undefined,
    });
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "query",
        issue: issue.message,
      }));
      return errorResponse("VALIDATION_FAILED", "Invalid search query.", 422, details);
    }

    const { lat, lng, city, pincode, radiusKm, risk } = parsed.data;
    const urgent = risk === "HIGH";

    const { hospitals, meta } = await findRankedHospitals({
      lat: lat ?? null,
      lng: lng ?? null,
      city: city ?? null,
      pincode: pincode ?? null,
      radiusKm,
      urgent,
    });

    return NextResponse.json({ hospitals, meta });
  } catch (err) {
    return jsonError(err);
  }
}
