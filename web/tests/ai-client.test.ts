import { afterEach, describe, expect, it, vi } from "vitest";

import * as ai from "@/lib/ai-client";
import { AppError } from "@/lib/errors";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("ai-client", () => {
  it("parses a successful envelope", async () => {
    const payload = { probability: 0.82, risk_level: "HIGH", model_version: 1 };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })),
    );
    const result = await ai.predictClinical({
      age: 57, sex: 1, cp: 4, trestbps: 140, chol: 241, fbs: 0,
      restecg: 1, thalach: 123, exang: 1, oldpeak: 0.2, slope: 2, ca: 0, thal: 7,
    });
    expect(result.probability).toBe(0.82);
    expect(result.model_version).toBe(1);
  });

  it("sends the internal key header", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await ai.predictSymptoms({ symptoms: [], symptom_labels: [] } as never);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["X-Internal-Key"]).toBeDefined();
  });

  it("maps a FastAPI error envelope to AppError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: { code: "MODEL_VERSION_NOT_FOUND", message: "no such version" },
          }),
          { status: 404 },
        ),
      ),
    );
    await expect(ai.activateMlVersion(99)).rejects.toMatchObject({
      code: "MODEL_VERSION_NOT_FOUND",
      status: 404,
    });
  });

  it("treats a 5xx as AI_SERVICE_UNAVAILABLE with status 502", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const error = await ai.predictSymptoms({} as never).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("AI_SERVICE_UNAVAILABLE");
    expect(error.status).toBe(502);
  });

  it("converts an aborted request (timeout) to AI_SERVICE_UNAVAILABLE", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () => {
              const err = new Error("aborted");
              err.name = "AbortError";
              reject(err);
            });
          }),
      ),
    );
    const promise = ai.aiHealth().catch((e) => e);
    await vi.advanceTimersByTimeAsync(6000);
    const error = await promise;
    expect(error.code).toBe("AI_SERVICE_UNAVAILABLE");
    expect(error.message).toMatch(/too long/i);
  });

  it("reports an unreachable service", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fetch failed"))));
    const error = await ai.aiHealth().catch((e) => e);
    expect(error.code).toBe("AI_SERVICE_UNAVAILABLE");
  });
});
