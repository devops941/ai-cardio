import { describe, expect, it } from "vitest";

import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("blocks the 11th call in a minute", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 10; i += 1) {
      expect(rateLimit(key, 10).allowed).toBe(true);
    }
    const eleventh = rateLimit(key, 10);
    expect(eleventh.allowed).toBe(false);
    expect(eleventh.retryAfterSeconds).toBeGreaterThan(0);
  });
});
