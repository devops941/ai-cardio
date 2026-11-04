// Probability banding and LLM/ML fusion (Section 7.4).

import type { RiskLevel } from "@/lib/constants";

const ORDER: Record<RiskLevel, number> = { LOW: 0, MODERATE: 1, HIGH: 2 };

export function bandFromProbability(p: number): RiskLevel {
  if (p < 0.4) return "LOW";
  if (p <= 0.7) return "MODERATE";
  return "HIGH";
}

export function fuseRisk(
  llm: RiskLevel | null,
  ml: RiskLevel | null,
  emergency: boolean,
): { finalRisk: RiskLevel | null; urgent: boolean } {
  if (emergency) return { finalRisk: "HIGH", urgent: true };

  if (llm == null && ml == null) return { finalRisk: null, urgent: false };
  if (llm == null) return { finalRisk: ml, urgent: ml === "HIGH" };
  if (ml == null) return { finalRisk: llm, urgent: llm === "HIGH" };

  const finalRisk = ORDER[llm] >= ORDER[ml] ? llm : ml;
  return { finalRisk, urgent: finalRisk === "HIGH" };
}
