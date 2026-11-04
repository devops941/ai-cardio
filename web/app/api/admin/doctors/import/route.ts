// POST /api/admin/doctors/import (Section 9.6).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import * as ai from "@/lib/ai-client";
import { requireAdmin } from "@/lib/auth";
import {
  DOCTOR_COLUMNS,
  DOCTOR_REQUIRED,
  assertColumns,
  cell,
  checkFormulaLike,
  isValidEmail,
  mapColumns,
  normaliseDays,
  parseInteger,
  requireTabular,
  type RejectedRow,
} from "@/lib/bulk-import";
import { AppError, jsonError } from "@/lib/errors";
import { validateFileMeta, validateFileSignature } from "@/lib/file-validate";
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
    const mapping = mapColumns(parsed.columns, DOCTOR_COLUMNS);
    assertColumns(mapping, DOCTOR_REQUIRED);

    const hospitals = await prisma.hospital.findMany({
      select: { id: true, name: true },
    });
    const hospitalByName = new Map<string, { id: string; count: number }>();
    for (const hospital of hospitals) {
      const key = hospital.name.trim().toLowerCase();
      const entry = hospitalByName.get(key);
      if (entry) entry.count += 1;
      else hospitalByName.set(key, { id: hospital.id, count: 1 });
    }

    const existingDoctors = await prisma.doctor.findMany({
      select: { name: true, hospitalId: true },
    });
    const seen = new Set(
      existingDoctors.map(
        (d) => `${d.name.trim().toLowerCase()}|${d.hospitalId ?? ""}`,
      ),
    );

    const rejected: RejectedRow[] = [];
    const rows: Record<string, unknown>[] = [];

    parsed.rows.forEach((row, index) => {
      const rowNumber = index + 2;
      try {
        const values = DOCTOR_COLUMNS.map((c) => cell(row, mapping, c));
        if (values.some((v) => v && checkFormulaLike(v))) {
          throw new Error("formula-like value");
        }

        const name = cell(row, mapping, "name");
        const specialization = cell(row, mapping, "specialization");
        const qualification = cell(row, mapping, "qualification");
        const phone = cell(row, mapping, "phone");
        const hospitalName = cell(row, mapping, "hospitalName");

        if (!name) throw new Error("name is required");
        if (!specialization) throw new Error("specialization is required");
        if (!qualification) throw new Error("qualification is required");
        if (!phone) throw new Error("phone is required");
        if (!hospitalName) throw new Error("hospitalName is required");

        const experienceRaw = cell(row, mapping, "experienceYears");
        const experienceYears = parseInteger(experienceRaw);
        if (experienceYears === null || experienceYears < 0) {
          throw new Error("experienceYears must be an integer >= 0");
        }

        const hospital = hospitalByName.get(hospitalName.toLowerCase());
        if (!hospital) throw new Error("hospital not found");
        if (hospital.count > 1) throw new Error("ambiguous hospital name");

        const availableDaysRaw = cell(row, mapping, "availableDays");
        const availableDays = normaliseDays(availableDaysRaw);
        if (availableDays === null) throw new Error("invalid day in availableDays");

        const email = cell(row, mapping, "email");
        if (email && !isValidEmail(email)) throw new Error("invalid email");

        const feeRaw = cell(row, mapping, "consultationFee");
        const consultationFee = feeRaw ? parseInteger(feeRaw) : null;
        if (feeRaw && (consultationFee === null || consultationFee < 0)) {
          throw new Error("consultationFee must be an integer >= 0");
        }

        const key = `${name.toLowerCase()}|${hospital.id}`;
        if (seen.has(key)) throw new Error("duplicate name for this hospital");
        seen.add(key);

        rows.push({
          name,
          specialization,
          qualification,
          experienceYears,
          phone,
          email: email || null,
          hospitalId: hospital.id,
          availableDays: availableDays.join(",") || null,
          consultationFee,
        });
      } catch (err) {
        rejected.push({
          row: rowNumber,
          reason: err instanceof Error ? err.message : "invalid row",
        });
      }
    });

    if (rows.length > 0) {
      await prisma.doctor.createMany({ data: rows as never });
    }

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "DOCTORS_IMPORTED",
        entity: "Doctor",
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
