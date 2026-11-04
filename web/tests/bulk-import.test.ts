import { describe, expect, it } from "vitest";

import {
  assertColumns,
  checkFormulaLike,
  mapColumns,
  normaliseDays,
  parseBoolean,
  parseNumber,
  HOSPITAL_COLUMNS,
  HOSPITAL_REQUIRED,
} from "@/lib/bulk-import";

describe("bulk import helpers", () => {
  it("flags formula-like cells", () => {
    expect(checkFormulaLike("=SUM(A1:A2)")).toBe(true);
    expect(checkFormulaLike("+1234")).toBe(true);
    expect(checkFormulaLike("@cmd")).toBe(true);
    expect(checkFormulaLike("Sunrise Hospital")).toBe(false);
  });

  it("parses booleans with a fallback", () => {
    expect(parseBoolean("yes")).toBe(true);
    expect(parseBoolean("No")).toBe(false);
    expect(parseBoolean("maybe")).toBeNull();
    expect(parseBoolean("", true)).toBe(true);
  });

  it("parses numbers and rejects garbage", () => {
    expect(parseNumber("12.5")).toBe(12.5);
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("")).toBeNull();
  });

  it("maps columns case- and separator-insensitively", () => {
    const mapping = mapColumns(["NAME", "Emergency 24x7"], HOSPITAL_COLUMNS);
    expect(mapping.name).toBe("NAME");
    expect(mapping.emergency24x7).toBe("Emergency 24x7");
  });

  it("throws when a required column is missing", () => {
    const mapping = mapColumns(["name", "city"], HOSPITAL_COLUMNS);
    expect(() => assertColumns(mapping, HOSPITAL_REQUIRED)).toThrowError();
  });

  it("normalises day lists", () => {
    expect(normaliseDays("Mon, Wed, fri")).toEqual(["Mon", "Wed", "Fri"]);
    expect(normaliseDays("Funday")).toBeNull();
  });
});
