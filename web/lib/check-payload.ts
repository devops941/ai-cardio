// Builds the payload sent to the AI service (Section 10.2 privacy rule).
//
// The AI service must never receive name, e-mail, phone, coordinates or raw
// clinical values, so this builder whitelists only the fields it needs.

import type { SymptomAIRequest } from "@/lib/ai-client";

export interface CheckPayloadInput {
  symptoms: string[];
  symptomLabels: string[];
  freeText?: string;
  age?: number | null;
  gender?: string | null;
  riskFactors: string[];
  durationLabel?: string | null;
  durationMin?: number | null;
  sudden: boolean;
  severity: number;
}

export function buildSymptomPayload(input: CheckPayloadInput): SymptomAIRequest {
  return {
    symptoms: input.symptoms,
    symptom_labels: input.symptomLabels,
    free_text: input.freeText ?? "",
    age: input.age ?? null,
    gender: input.gender ?? null,
    risk_factors: input.riskFactors,
    duration_label: input.durationLabel ?? null,
    duration_min: input.durationMin ?? null,
    sudden: input.sudden,
    severity: input.severity,
  };
}
