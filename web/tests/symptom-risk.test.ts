import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { bandFromScore, scoreSymptomRisk } from "@/lib/symptom-risk";

interface Vector {
  symptoms: string[];
  severity?: number;
  duration_min?: number | null;
  risk_factors?: string[];
  age?: number | null;
  sudden?: boolean;
  expected: string;
}

const vectors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../docs/test-vectors/red_flags.json"), "utf8"),
) as { symptom_risk: Vector[] };

describe("symptom risk scorer (shared vectors)", () => {
  for (const vector of vectors.symptom_risk) {
    it(`${vector.symptoms.join("+") || "none"} sev=${vector.severity ?? 1} -> ${vector.expected}`, () => {
      const result = scoreSymptomRisk({
        symptoms: vector.symptoms,
        severity: vector.severity,
        durationMin: vector.duration_min,
        riskFactors: vector.risk_factors,
        age: vector.age,
        sudden: vector.sudden,
      });
      expect(result.riskLevel).toBe(vector.expected);
    });
  }
});

describe("band boundaries", () => {
  it("maps scores to bands at the shared cut-offs", () => {
    expect(bandFromScore(0)).toBe("LOW");
    expect(bandFromScore(3)).toBe("LOW");
    expect(bandFromScore(4)).toBe("MODERATE");
    expect(bandFromScore(7)).toBe("MODERATE");
    expect(bandFromScore(8)).toBe("HIGH");
  });

  it("returns a Low band for an empty questionnaire", () => {
    expect(scoreSymptomRisk({ symptoms: [] }).riskLevel).toBe("LOW");
  });

  it("never reports below Low for the worst presentation", () => {
    const result = scoreSymptomRisk({
      symptoms: [
        "chest_pain",
        "pain_spreading",
        "breathlessness",
        "cold_sweat",
        "bluish_skin",
        "fainting",
      ],
      severity: 10,
      durationMin: 60,
      riskFactors: ["diabetes", "smoking", "hypertension", "high_cholesterol"],
      age: 70,
      sudden: true,
    });
    expect(result.riskLevel).toBe("HIGH");
    expect(result.score).toBeGreaterThan(7);
  });
});
