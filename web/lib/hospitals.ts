// Hospital search and ranking (Section 9.5).

import "server-only";

import { prisma } from "@/lib/prisma";
import { rankHospitals, type HospitalLike } from "@/lib/ranking";

export type Risk = "LOW" | "MODERATE" | "HIGH";

export interface RankedHospitalDTO {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
  score: number;
  emergency24x7: boolean;
  hasCardiology: boolean;
  hasCathLab: boolean;
  rating: number;
  cardiologistCount: number;
  doctors: { id: string; name: string; specialization: string | null }[];
  directionsUrl: string | null;
}

export interface HospitalsMeta {
  mode: "geo" | "manual" | "none";
  radiusKm: number;
  radiusExpanded: boolean;
  urgent: boolean;
}

export interface FindRankedHospitalsInput {
  lat?: number | null;
  lng?: number | null;
  city?: string | null;
  pincode?: string | null;
  radiusKm?: number;
  urgent: boolean;
}

const TOP_N = 5;

export async function findRankedHospitals(
  input: FindRankedHospitalsInput,
): Promise<{ hospitals: RankedHospitalDTO[]; meta: HospitalsMeta }> {
  const radiusKm = input.radiusKm ?? Number(process.env.DEFAULT_RADIUS_KM ?? 25);
  const urgent = input.urgent;

  let raw: Record<string, unknown>[] = [];
  let mode: HospitalsMeta["mode"] = "none";
  let radiusExpanded = false;

  if (input.lat != null && input.lng != null) {
    mode = "geo";
    raw = await geoSearch(input.lat, input.lng, radiusKm);
    if (raw.length === 0 && radiusKm < 100) {
      raw = await geoSearch(input.lat, input.lng, 100);
      radiusExpanded = raw.length > 0;
    }
  } else if (input.city || input.pincode) {
    mode = "manual";
    raw = await prisma.hospital.findMany({
      where: {
        isActive: true,
        OR: [
          ...(input.city
            ? [{ city: { equals: input.city, mode: "insensitive" as const } }]
            : []),
          ...(input.pincode ? [{ pincode: input.pincode }] : []),
        ],
      },
      take: 50,
    });
  }

  if (raw.length === 0) {
    return {
      hospitals: [],
      meta: { mode, radiusKm, radiusExpanded, urgent },
    };
  }

  const ids = raw.map((h) => String(h.id));
  const doctors = await prisma.doctor.findMany({
    where: { hospitalId: { in: ids }, isActive: true },
    select: { id: true, name: true, specialization: true, hospitalId: true },
  });

  const doctorsByHospital = new Map<string, typeof doctors>();
  for (const doctor of doctors) {
    if (!doctor.hospitalId) continue;
    const list = doctorsByHospital.get(doctor.hospitalId) ?? [];
    list.push(doctor);
    doctorsByHospital.set(doctor.hospitalId, list);
  }

  const candidates = raw.map((h) => {
    const distanceMeters = h.distanceMeters as number | undefined;
    const hospitalDoctors = doctorsByHospital.get(String(h.id)) ?? [];
    const cardiologists = hospitalDoctors.filter((d) =>
      /cardiolog/i.test(d.specialization ?? ""),
    );
    const like: HospitalLike = {
      id: String(h.id),
      distanceKm: distanceMeters != null ? distanceMeters / 1000 : null,
      hasCardiology: Boolean(h.hasCardiology),
      hasCathLab: Boolean(h.hasCathLab),
      emergency24x7: Boolean(h.emergency24x7),
      rating: Number(h.rating ?? 0),
      cardiologistCount: cardiologists.length || Number(h.cardiologistCount ?? 0),
    };
    return { raw: h, like, cardiologists: hospitalDoctors };
  });

  const ranked = rankHospitals(
    candidates.map((c) => c.like),
    radiusKm,
    urgent,
  );

  const hospitals: RankedHospitalDTO[] = ranked.slice(0, TOP_N).map((entry) => {
    const match = candidates.find((c) => c.like.id === entry.hospital.id)!;
    const h = match.raw;
    const lat = (h.latitude as number | null) ?? null;
    const lng = (h.longitude as number | null) ?? null;
    return {
      id: String(h.id),
      name: String(h.name),
      address: (h.address as string | null) ?? null,
      city: (h.city as string | null) ?? null,
      phone: (h.phone as string | null) ?? null,
      lat,
      lng,
      distanceKm:
        entry.distanceKm != null ? Math.round(entry.distanceKm * 10) / 10 : null,
      score: entry.score,
      emergency24x7: Boolean(h.emergency24x7),
      hasCardiology: Boolean(h.hasCardiology),
      hasCathLab: Boolean(h.hasCathLab),
      rating: Number(h.rating ?? 0),
      cardiologistCount: match.like.cardiologistCount,
      doctors: match.cardiologists.map((d) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
      })),
      directionsUrl:
        lat != null && lng != null
          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
          : null,
    };
  });

  return {
    hospitals,
    meta: { mode, radiusKm, radiusExpanded, urgent },
  };
}

async function geoSearch(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<Record<string, unknown>[]> {
  const results = await prisma.hospital.aggregateRaw({
    pipeline: [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          maxDistance: radiusKm * 1000,
          spherical: true,
        },
      },
      { $match: { isActive: true } },
      { $limit: 20 },
    ],
  });

  const list = Array.isArray(results) ? results : [];
  return list.map((doc) => {
    const record = doc as Record<string, unknown>;
    const id = record._id as { $oid?: string } | string;
    return {
      ...record,
      id: typeof id === "string" ? id : id?.$oid ?? "",
    };
  });
}
