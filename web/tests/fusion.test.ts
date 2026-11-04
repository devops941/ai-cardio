import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { bandFromProbability, fuseRisk } from "@/lib/fusion";

const vectors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../docs/test-vectors/red_flags.json"), "utf8"),
) as {
  fusion: { llm: string | null; ml: string | null; emergency: boolean; expected: string | null }[];
  bands: { probability: number; expected: string }[];
};

describe("fusion (shared vectors)", () => {
  for (const vector of vectors.fusion) {
    it(`llm=${vector.llm} ml=${vector.ml} emergency=${vector.emergency}`, () => {
      const result = fuseRisk(
        vector.llm as never,
        vector.ml as never,
        vector.emergency,
      );
      expect(result.finalRisk).toBe(vector.expected);
    });
  }
});

describe("probability bands", () => {
  for (const vector of vectors.bands) {
    it(`p=${vector.probability}`, () => {
      expect(bandFromProbability(vector.probability)).toBe(vector.expected);
    });
  }
});
