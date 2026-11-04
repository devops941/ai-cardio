import { describe, expect, it } from "vitest";

import { feedbackSchema, hospitalSchema, registerSchema } from "@/lib/validators";

describe("registerSchema", () => {
  const base = { name: "Ann", email: "a@b.com", password: "passw0rd" };

  it("requires consent", () => {
    expect(registerSchema.safeParse({ ...base, adult: true }).success).toBe(false);
  });

  it("requires 18+", () => {
    expect(registerSchema.safeParse({ ...base, consent: true }).success).toBe(false);
  });

  it("accepts a valid payload and lowercases email", () => {
    const parsed = registerSchema.safeParse({
      name: "Ann",
      email: "A@B.com",
      password: "passw0rd",
      consent: true,
      adult: true,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe("a@b.com");
  });

  it("rejects weak passwords", () => {
    expect(
      registerSchema.safeParse({ ...base, password: "short", consent: true, adult: true }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...base, password: "nodigits", consent: true, adult: true }).success,
    ).toBe(false);
  });
});

describe("feedbackSchema", () => {
  it("rejects rating 0 and 6", () => {
    expect(feedbackSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it("accepts rating 1-5", () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(feedbackSchema.safeParse({ rating }).success).toBe(true);
    }
  });
});

describe("hospitalSchema", () => {
  it("rejects latitude 123", () => {
    expect(hospitalSchema.safeParse({ name: "H", latitude: 123 }).success).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(hospitalSchema.safeParse({ latitude: 12 }).success).toBe(false);
  });

  it("accepts a minimal valid hospital", () => {
    expect(hospitalSchema.safeParse({ name: "Heart Care" }).success).toBe(true);
  });
});
