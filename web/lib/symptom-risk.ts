// Deterministic symptom-only risk scoring (Section 7.7) - TypeScript mirror.
//
// Gives a Low / Moderate / High band from the questionnaire answers alone, so a
// result exists even when no clinical lab values are supplied and the AI
// service, knowledge base or LLM cannot help. Must stay identical to
// ai-service/app/services/symptom_risk.py; both are checked against
// docs/test-vectors/red_flags.json.

import type { RiskLevel } from "@/lib/constants";

const SYMPTOM_WEIGHTS: Record<string, number> = {
  chest_pain: 3,
  pain_spreading: 3,
  breathlessness: 2,
  palpitations: 1,
  dizziness: 1,
  fainting: 3,
  cold_sweat: 2,
  nausea_chest: 2,
  fatigue: 1,
  leg_swelling: 2,
  reduced_exercise_tolerance: 1,
  orthopnea: 2,
  rapid_weight_gain: 1,
  bluish_skin: 3,
};

const RISK_FACTOR_WEIGHTS: Record<string, number> = {
  diabetes: 2,
  hypertension: 2,
  smoking: 2,
  high_cholesterol: 2,
  family_history: 1,
  obesity: 1,
  sedentary: 1,
};

// Symptoms whose meaning changes once they persist past 15 minutes.
const CHEST_RELATED = new Set(["chest_pain", "pain_spreading", "breathlessness"]);

const SYMPTOM_CAP = 9;
const FACTOR_CAP = 6;
const LOW_MAX = 3;
const MODERATE_MAX = 7;

function severityPoints(severity: number): number {
  if (severity <= 3) return 0;
  if (severity <= 6) return 1;
  if (severity <= 8) return 3;
  return 5;
}

function durationPoints(symptoms: Set<string>, durationMin?: number | null): number {
  if (durationMin == null) return 0;
  if ([...symptoms].some((s) => CHEST_RELATED.has(s)) && durationMin > 15) return 2;
  if (durationMin > 1440) return 1;
  return 0;
}

function agePoints(age?: number | null): number {
  if (age == null) return 0;
  if (age >= 60) return 2;
  if (age >= 45) return 1;
  return 0;
}

export function bandFromScore(score: number): RiskLevel {
  if (score <= LOW_MAX) return "LOW";
  if (score <= MODERATE_MAX) return "MODERATE";
  return "HIGH";
}

export interface SymptomRiskInput {
  symptoms: string[];
  severity?: number;
  durationMin?: number | null;
  riskFactors?: string[];
  age?: number | null;
  sudden?: boolean;
}

export interface SymptomRiskResult {
  riskLevel: RiskLevel;
  score: number;
  reasons: string[];
}

export function scoreSymptomRisk(input: SymptomRiskInput): SymptomRiskResult {
  const selected = new Set(input.symptoms);

  const symptomPoints = Math.min(
    [...selected].reduce((sum, s) => sum + (SYMPTOM_WEIGHTS[s] ?? 0), 0),
    SYMPTOM_CAP,
  );
  const factorPoints = Math.min(
    (input.riskFactors ?? []).reduce((sum, f) => sum + (RISK_FACTOR_WEIGHTS[f] ?? 0), 0),
    FACTOR_CAP,
  );
  const sevPoints = severityPoints(input.severity ?? 1);
  const durPoints = durationPoints(selected, input.durationMin);
  const aPoints = agePoints(input.age);
  const suddenPoints = input.sudden ? 1 : 0;

  const score =
    symptomPoints + factorPoints + sevPoints + durPoints + aPoints + suddenPoints;

  const reasons: string[] = [];
  if (symptomPoints) reasons.push(`symptoms +${symptomPoints}`);
  if (factorPoints) reasons.push(`risk factors +${factorPoints}`);
  if (sevPoints) reasons.push(`severity +${sevPoints}`);
  if (durPoints) reasons.push(`duration +${durPoints}`);
  if (aPoints) reasons.push(`age +${aPoints}`);
  if (suddenPoints) reasons.push("sudden onset +1");

  return { riskLevel: bandFromScore(score), score, reasons };
}
