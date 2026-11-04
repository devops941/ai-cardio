// Deterministic emergency rules (Section 7.6).

const EMERGENCY_PHRASES = ["crushing", "heavy weight on chest", "elephant on my chest"];

export interface RedFlagInput {
  symptoms: string[];
  durationMin?: number | null;
  severity: number;
  sudden: boolean;
  freeText?: string | null;
}

export function checkRedFlags(input: RedFlagInput): string[] {
  const symptoms = new Set(input.symptoms);
  const fired: string[] = [];
  const chest = symptoms.has("chest_pain");

  if (chest && input.durationMin != null && input.durationMin > 15) fired.push("RF-01");
  if (chest && symptoms.has("pain_spreading")) fired.push("RF-02");
  if (chest && symptoms.has("cold_sweat")) fired.push("RF-03");
  if (chest && symptoms.has("breathlessness")) fired.push("RF-04");
  if (symptoms.has("fainting")) fired.push("RF-05");
  if (symptoms.has("breathlessness") && (input.severity >= 8 || input.sudden)) fired.push("RF-06");
  if (symptoms.has("nausea_chest") && symptoms.has("cold_sweat")) fired.push("RF-07");

  const text = (input.freeText ?? "").toLowerCase();
  if (EMERGENCY_PHRASES.some((p) => text.includes(p))) fired.push("RF-08");

  return fired;
}
