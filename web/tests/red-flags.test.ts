import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { checkRedFlags } from "@/lib/red-flags";

interface Vector {
  symptoms: string[];
  duration_min: number | null;
  severity: number;
  sudden: boolean;
  free_text: string;
  expected: string[];
}

const vectors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../docs/test-vectors/red_flags.json"), "utf8"),
) as { red_flags: Vector[] };

describe("red flags (shared vectors)", () => {
  for (const [index, vector] of vectors.red_flags.entries()) {
    it(`vector ${index + 1} fires ${vector.expected.join(",") || "nothing"}`, () => {
      const fired = checkRedFlags({
        symptoms: vector.symptoms,
        durationMin: vector.duration_min,
        severity: vector.severity,
        sudden: vector.sudden,
        freeText: vector.free_text,
      });
      expect(fired.sort()).toEqual([...vector.expected].sort());
    });
  }
});
