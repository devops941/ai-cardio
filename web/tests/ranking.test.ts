import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { rankHospitals, scoreHospital, type HospitalLike } from "@/lib/ranking";

const vectors = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../docs/test-vectors/red_flags.json"), "utf8"),
) as {
  ranking: {
    radiusKm: number;
    hospitals: HospitalLike[];
    expectedNormal: { id: string; score: number }[];
    expectedUrgent: { id: string; score: number }[];
  };
};

describe("hospital ranking (shared vectors)", () => {
  const { radiusKm, hospitals, expectedNormal, expectedUrgent } = vectors.ranking;

  it("normal weights produce the expected order", () => {
    const ranked = rankHospitals(hospitals, radiusKm, false);
    expect(ranked.map((r) => r.hospital.id)).toEqual(expectedNormal.map((e) => e.id));
    expectedNormal.forEach((expected, index) => {
      expect(ranked[index].score).toBeCloseTo(expected.score, 3);
    });
  });

  it("urgent weights produce the expected order", () => {
    const ranked = rankHospitals(hospitals, radiusKm, true);
    expect(ranked.map((r) => r.hospital.id)).toEqual(expectedUrgent.map((e) => e.id));
  });

  it("handles a missing distance by renormalising", () => {
    const score = scoreHospital(
      { ...hospitals[0], distanceKm: null },
      radiusKm,
      false,
    );
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("ranks a farther 24x7 hospital above a nearer one that lacks it, in urgent mode", () => {
    const nearby: HospitalLike = {
      id: "N",
      distanceKm: 1,
      hasCardiology: true,
      hasCathLab: false,
      emergency24x7: false,
      rating: 4.0,
      cardiologistCount: 2,
    };
    const farButOpen: HospitalLike = {
      id: "F",
      distanceKm: 12,
      hasCardiology: true,
      hasCathLab: false,
      emergency24x7: true,
      rating: 4.0,
      cardiologistCount: 2,
    };

    const normal = rankHospitals([nearby, farButOpen], radiusKm, false);
    expect(normal[0].hospital.id).toBe("N");

    const urgent = rankHospitals([nearby, farButOpen], radiusKm, true);
    expect(urgent[0].hospital.id).toBe("F");
  });

  it("still scores a manual-mode (distance null) hospital", () => {
    const manual = rankHospitals(
      [{ ...hospitals[1], distanceKm: null }],
      radiusKm,
      false,
    );
    expect(manual).toHaveLength(1);
    expect(manual[0].score).toBeGreaterThan(0);
    expect(manual[0].score).toBeLessThanOrEqual(1);
  });
});
