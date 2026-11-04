import { describe, expect, it } from "vitest";

import { buildSymptomPayload } from "@/lib/check-payload";

describe("buildSymptomPayload (privacy)", () => {
  it("never includes identity, coordinates or clinical values", () => {
    const payload = buildSymptomPayload({
      symptoms: ["chest_pain"],
      symptomLabels: ["Chest pain / pressure / tightness"],
      freeText: "",
      age: 54,
      gender: "male",
      riskFactors: ["smoking"],
      durationLabel: "15 to 60 minutes",
      durationMin: 30,
      sudden: false,
      severity: 6,
    });

    const serialised = JSON.stringify(payload);
    for (const forbidden of ["name", "email", "phone", "lat", "lng", "clinical", "trestbps", "chol"]) {
      expect(serialised).not.toContain(forbidden);
    }
    expect(Object.keys(payload).sort()).toEqual(
      [
        "age",
        "duration_label",
        "duration_min",
        "free_text",
        "gender",
        "risk_factors",
        "severity",
        "sudden",
        "symptom_labels",
        "symptoms",
      ].sort(),
    );
  });
});
