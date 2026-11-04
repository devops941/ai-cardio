// Hospital ranking (Section 9.5).
//
// score = wD*D + wC*C + wE*E + wR*R + wA*A
//   D = max(0, 1 - distanceKm / radiusKm)
//   C = 0.5*hasCardiology + 0.5*hasCathLab
//   E = 1 if emergency24x7 else 0
//   R = rating / 5
//   A = min(cardiologistCount, 5) / 5
// When distance is unknown, the D term is dropped and the rest is divided by (1 - wD).

export interface HospitalLike {
  id: string;
  distanceKm?: number | null;
  hasCardiology: boolean;
  hasCathLab: boolean;
  emergency24x7: boolean;
  rating: number;
  cardiologistCount: number;
}

export interface RankedHospital<T extends HospitalLike = HospitalLike> {
  hospital: T;
  score: number;
  distanceKm?: number | null;
}

interface Weights {
  wD: number;
  wC: number;
  wE: number;
  wR: number;
  wA: number;
}

const NORMAL: Weights = { wD: 0.45, wC: 0.2, wE: 0.15, wR: 0.1, wA: 0.1 };
const URGENT: Weights = { wD: 0.35, wC: 0.25, wE: 0.3, wR: 0.05, wA: 0.05 };

export function scoreHospital(
  hospital: HospitalLike,
  radiusKm: number,
  urgent: boolean,
): number {
  const w = urgent ? URGENT : NORMAL;
  const C = 0.5 * (hospital.hasCardiology ? 1 : 0) + 0.5 * (hospital.hasCathLab ? 1 : 0);
  const E = hospital.emergency24x7 ? 1 : 0;
  const R = hospital.rating / 5;
  const A = Math.min(hospital.cardiologistCount, 5) / 5;

  const hasDistance =
    hospital.distanceKm != null && Number.isFinite(hospital.distanceKm);

  if (!hasDistance) {
    const sum = w.wC * C + w.wE * E + w.wR * R + w.wA * A;
    return sum / (1 - w.wD);
  }

  const D = Math.max(0, 1 - (hospital.distanceKm as number) / radiusKm);
  return w.wD * D + w.wC * C + w.wE * E + w.wR * R + w.wA * A;
}

export function rankHospitals<T extends HospitalLike>(
  hospitals: T[],
  radiusKm: number,
  urgent: boolean,
): RankedHospital<T>[] {
  const scored = hospitals.map((hospital) => ({
    hospital,
    score: scoreHospital(hospital, radiusKm, urgent),
    distanceKm: hospital.distanceKm ?? null,
  }));

  scored.sort((a, b) => {
    // In urgent mode, hospitals with 24x7 emergency always come first.
    if (urgent) {
      const ae = a.hospital.emergency24x7 ? 1 : 0;
      const be = b.hospital.emergency24x7 ? 1 : 0;
      if (ae !== be) return be - ae;
    }
    if (b.score !== a.score) return b.score - a.score;
    const ad = a.distanceKm ?? Number.POSITIVE_INFINITY;
    const bd = b.distanceKm ?? Number.POSITIVE_INFINITY;
    return ad - bd;
  });

  return scored.map((s) => ({ ...s, score: round(s.score) }));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
