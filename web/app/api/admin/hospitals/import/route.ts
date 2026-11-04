// POST /api/admin/hospitals/import (Section 9.6).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import * as ai from "@/lib/ai-client";
import { requireAdmin } from "@/lib/auth";
import {
  HOSPITAL_COLUMNS,
  HOSPITAL_REQUIRED,
  assertColumns,
  cell,
  checkFormulaLike,
  mapColumns,
  parseBoolean,
  parseInteger,
  parseNumber,
  requireTabular,
  type RejectedRow,
} from "@/lib/bulk-import";
import { AppError, jsonError } from "@/lib/errors";
import { validateFileMeta, validateFileSignature } from "@/lib/file-validate";
import { withLocation } from "@/lib/geo";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_FAILED", "A file is required.", 422);
    }

    validateFileMeta(file.name, file.size, { tabularOnly: true });
    await validateFileSignature(file);
    requireTabular(file.name);

    const parsed = await ai.parseTabular(file);
    const mapping = mapColumns(parsed.columns, HOSPITAL_COLUMNS);
    assertColumns(mapping, HOSPITAL_REQUIRED);

    const seen = new Set<string>();
    const rejected: RejectedRow[] = [];
    const rows: Record<string, unknown>[] = [];

    const existing = await prisma.hospital.findMany({
      select: { name: true, pincode: true },
    });
    const existingKeys = new Set(
      existing.map((h) => `${(h.name ?? "").trim().toLowerCase()}|${h.pincode ?? ""}`),
    );

    parsed.rows.forEach((row, index) => {
      const rowNumber = index + 2;
      try {
        const values = HOSPITAL_COLUMNS.map((c) => cell(row, mapping, c));
        if (values.some((v) => v && checkFormulaLike(v))) {
          throw new Error("formula-like value");
        }

        const name = cell(row, mapping, "name");
        const address = cell(row, mapping, "address");
        const city = cell(row, mapping, "city");
        const state = cell(row, mapping, "state");
        const pincode = cell(row, mapping, "pincode");
        const phone = cell(row, mapping, "phone");

        if (!name) throw new Error("name is required");
        if (!address) throw new Error("address is required");
        if (!city) throw new Error("city is required");
        if (!state) throw new Error("state is required");
        if (!/^\d{6}$/.test(pincode)) throw new Error("pincode must be 6 digits");
        if (!phone) throw new Error("phone is required");

        const latitude = parseNumber(cell(row, mapping, "latitude"));
        const longitude = parseNumber(cell(row, mapping, "longitude"));
        if (latitude === null || latitude < -90 || latitude > 90) {
          throw new Error("latitude must be between -90 and 90");
        }
        if (longitude === null || longitude < -180 || longitude > 180) {
          throw new Error("longitude must be between -180 and 180");
        }

        const emergency = parseBoolean(cell(row, mapping, "emergency24x7"));
        const cardiology = parseBoolean(cell(row, mapping, "hasCardiology"));
        const cathLab = parseBoolean(cell(row, mapping, "hasCathLab"));
        if (emergency === null || cardiology === null || cathLab === null) {
          throw new Error("boolean columns accept yes/no/true/false/1/0");
        }

        const rating = parseNumber(cell(row, mapping, "rating")) ?? 0;
        if (rating < 0 || rating > 5) throw new Error("rating must be 0-5");

        const bedsRaw = cell(row, mapping, "beds");
        const beds = bedsRaw ? parseInteger(bedsRaw) : null;
        if (bedsRaw && (beds === null || beds < 0)) {
          throw new Error("beds must be an integer >= 0");
        }

        const key = `${name.toLowerCase()}|${pincode}`;
        if (seen.has(key) || existingKeys.has(key)) {
          throw new Error("duplicate name and pincode");
        }
        seen.add(key);

        rows.push(
          withLocation({
            name,
            address,
            city,
            state,
            pincode,
            phone,
            latitude,
            longitude,
            emergency24x7: emergency,
            hasCardiology: cardiology,
            hasCathLab: cathLab,
            rating,
            beds,
          }),
        );
      } catch (err) {
        rejected.push({
          row: rowNumber,
          reason: err instanceof Error ? err.message : "invalid row",
        });
      }
    });

    if (rows.length > 0) {
      await prisma.hospital.createMany({ data: rows as never });
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "HOSPITALS_IMPORTED",
        entity: "Hospital",
        metadata: { inserted: rows.length, rejected: rejected.length },
      },
    });

    return NextResponse.json({
      inserted: rows.length,
      rejected,
      total: parsed.rows.length,
    });
  } catch (err) {
    return jsonError(err);
  }
}
