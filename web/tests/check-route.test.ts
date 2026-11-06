import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Route-handler logic that needs no browser (Section 12.3). The AI client,
// auth, database and hospital search are mocked so the orchestration itself is
// exercised for real.
const predictSymptoms = vi.fn();
const predictClinical = vi.fn();
const create = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireUser: async () => ({ id: "user-1", email: "u@example.com" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { prediction: { create: (...args: unknown[]) => create(...args) } },
}));

vi.mock("@/lib/ai-client", () => ({
  predictSymptoms: (...args: unknown[]) => predictSymptoms(...args),
  predictClinical: (...args: unknown[]) => predictClinical(...args),
}));

vi.mock("@/lib/hospitals", () => ({
  findRankedHospitals: async () => ({
    hospitals: [
      {
        id: "h1",
        name: "Sunrise Heart Institute",
        emergency24x7: true,
        distanceKm: 1.4,
        score: 0.93,
      },
    ],
    meta: { mode: "geo", radiusKm: 25, radiusExpanded: false, urgent: true },
  }),
}));

import { POST } from "@/app/api/check/route";

const EMERGENCY_BODY = {
  symptoms: ["chest_pain", "pain_spreading", "cold_sweat"],
  duration: "15_60min",
  severity: 9,
  consent: true,
  location: { lat: 12.97, lng: 77.59 },
};

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

beforeEach(() => {
  create.mockReset().mockResolvedValue({ id: "pred-1" });
  predictSymptoms.mockReset();
  predictClinical.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/check orchestration", () => {
  it("returns the emergency banner, HIGH risk and hospitals when the AI service fails", async () => {
    predictSymptoms.mockRejectedValue(new Error("AI service down"));

    const response = await POST(makeRequest(EMERGENCY_BODY));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("llm_unavailable");
    expect(body.emergency).toBe(true);
    expect(body.finalRisk).toBe("HIGH");
    expect(body.result.explanation).toMatch(/unavailable/i);
    expect(body.hospitals.length).toBeGreaterThan(0);
    expect(body.hospitals[0].emergency24x7).toBe(true);
  });

  it("omits the ML result when the clinical call fails but keeps the symptom result", async () => {
    predictSymptoms.mockResolvedValue({
      status: "ok",
      emergency: false,
      fired_rules: [],
      is_heart_related: true,
      risk_level: "MODERATE",
      possible_conditions: [],
      explanation: "ok",
      recommended_specialist: "Cardiologist",
      next_steps: [],
      lifestyle_tips: [],
      sources: [],
      disclaimer: "d",
      message: null,
      retrieved: [],
    });
    predictClinical.mockRejectedValue(new Error("no active model"));

    const response = await POST(
      makeRequest({
        symptoms: ["chest_pain"],
        consent: true,
        clinical: {
          age: 57, sex: 1, cp: 4, trestbps: 140, chol: 241, fbs: 0,
          restecg: 1, thalach: 123, exang: 1, oldpeak: 0.2, slope: 2, ca: 0, thal: 7,
        },
      }),
    );
    const body = await response.json();

    expect(body.status).toBe("ok");
    expect(body.mlUnavailable).toBe(true);
    expect(body.mlProbability).toBeNull();
    expect(body.finalRisk).toBe("MODERATE");
  });

  it("rejects a payload without consent", async () => {
    const response = await POST(makeRequest({ symptoms: ["chest_pain"] }));
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("falls back to the deterministic symptom score when the AI service is down", async () => {
    predictSymptoms.mockRejectedValue(new Error("AI service down"));

    const response = await POST(
      makeRequest({
        symptoms: ["bluish_skin", "cold_sweat"],
        severity: 8,
        consent: true,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("llm_unavailable");
    expect(body.emergency).toBe(false);
    expect(body.llmRisk).toBe("HIGH");
    expect(body.finalRisk).toBe("HIGH");
    expect(body.result.risk_level).toBe("HIGH");
  });

  it("reports a Low band from symptoms alone for a mild presentation", async () => {
    predictSymptoms.mockRejectedValue(new Error("AI service down"));

    const response = await POST(
      makeRequest({ symptoms: ["fatigue"], severity: 2, consent: true }),
    );
    const body = await response.json();

    expect(body.llmRisk).toBe("LOW");
    expect(body.finalRisk).toBe("LOW");
  });

  it("keeps the non-heart refusal unbanded", async () => {
    predictSymptoms.mockResolvedValue({
      status: "non_heart",
      emergency: false,
      fired_rules: [],
      is_heart_related: false,
      risk_level: null,
      possible_conditions: [],
      explanation: "not heart",
      recommended_specialist: null,
      next_steps: [],
      lifestyle_tips: [],
      sources: [],
      disclaimer: "d",
      message: "not heart",
      retrieved: [],
    });

    const response = await POST(makeRequest({ symptoms: ["chest_pain"], consent: true }));
    const body = await response.json();

    expect(body.status).toBe("non_heart");
    expect(body.finalRisk).toBeNull();
  });
});
