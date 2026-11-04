// Bulk import parsing and validation (Section 9.6).

import { AppError } from "@/lib/errors";

export interface RejectedRow {
  row: number;
  reason: string;
}

export interface ImportResult<T> {
  inserted: number;
  rejected: RejectedRow[];
  total: number;
  created: T[];
}

const FORMULA_PREFIX = /^[=+\-@]/;

export function normaliseHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function mapColumns(
  columns: string[],
  expected: string[],
): Record<string, string> {
  const lookup = new Map<string, string>();
  for (const column of columns) {
    lookup.set(normaliseHeader(column), column);
  }
  const mapping: Record<string, string> = {};
  const missing: string[] = [];
  for (const field of expected) {
    const found = lookup.get(normaliseHeader(field));
    if (found) mapping[field] = found;
    else missing.push(field);
  }
  return { ...mapping, __missing: missing.join(",") } as Record<string, string>;
}

export function missingColumns(mapping: Record<string, string>): string[] {
  const missing = mapping.__missing;
  return missing ? missing.split(",").filter(Boolean) : [];
}

export function cell(
  row: Record<string, string>,
  mapping: Record<string, string>,
  field: string,
): string {
  const column = mapping[field];
  if (!column) return "";
  return (row[column] ?? "").toString().trim();
}

export function checkFormulaLike(value: string): boolean {
  return FORMULA_PREFIX.test(value.trim());
}

export function parseBoolean(value: string, fallback = false): boolean | null {
  const v = value.trim().toLowerCase();
  if (v === "") return fallback;
  if (["yes", "true", "1", "y"].includes(v)) return true;
  if (["no", "false", "0", "n"].includes(v)) return false;
  return null;
}

export function parseNumber(value: string): number | null {
  const v = value.trim();
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function parseInteger(value: string): number | null {
  const n = parseNumber(value);
  if (n === null || !Number.isInteger(n)) return null;
  return n;
}

export const HOSPITAL_COLUMNS = [
  "name",
  "address",
  "city",
  "state",
  "pincode",
  "phone",
  "latitude",
  "longitude",
  "emergency24x7",
  "hasCardiology",
  "hasCathLab",
  "rating",
  "beds",
];

export const DOCTOR_COLUMNS = [
  "name",
  "specialization",
  "qualification",
  "experienceYears",
  "phone",
  "email",
  "hospitalName",
  "availableDays",
  "consultationFee",
];

export const HOSPITAL_REQUIRED = ["name", "address", "city", "state", "pincode", "phone", "latitude", "longitude"];
export const DOCTOR_REQUIRED = ["name", "specialization", "qualification", "experienceYears", "phone", "hospitalName"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LOOKUP = new Map<string, string>(
  DAYS.flatMap((day) => [
    [day.toLowerCase(), day],
    [day.slice(0, 2).toLowerCase(), day],
    [day.slice(0, 1).toLowerCase(), day],
  ]),
);
DAY_LOOKUP.set("sunday", "Sun");
DAY_LOOKUP.set("saturday", "Sat");
DAY_LOOKUP.set("tuesday", "Tue");
DAY_LOOKUP.set("wednesday", "Wed");
DAY_LOOKUP.set("thursday", "Thu");
DAY_LOOKUP.set("friday", "Fri");
DAY_LOOKUP.set("monday", "Mon");

export function normaliseDays(value: string): string[] | null {
  if (!value.trim()) return [];
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    const key = part.toLowerCase().replace(/\.$/, "");
    const day = DAY_LOOKUP.get(key);
    if (!day) return null;
    if (!out.includes(day)) out.push(day);
  }
  return out.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function requireTabular(filename: string): void {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (![".xlsx", ".xls", ".csv"].includes(ext)) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      "Only .xlsx, .xls and .csv files are accepted for import.",
      415,
    );
  }
}

export function assertColumns(
  mapping: Record<string, string>,
  required: string[],
): void {
  const missing = missingColumns(mapping).filter((c) => required.includes(c));
  if (missing.length > 0) {
    throw new AppError(
      "VALIDATION_FAILED",
      `Missing required column(s): ${missing.join(", ")}.`,
      422,
      missing.map((column) => ({ field: column, issue: "missing column" })),
    );
  }
}
