"use client";

import { useState } from "react";

import { HospitalCard, type HospitalCardData } from "@/components/hospital-list";
import { HospitalMapDynamic } from "@/components/map/hospital-map-dynamic";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface HospitalsMeta {
  mode: string;
  radiusKm: number;
  radiusExpanded: boolean;
  urgent: boolean;
}

export function HospitalSection({
  initialHospitals,
  meta,
  city,
  pincode,
  risk,
}: {
  initialHospitals: HospitalCardData[];
  meta: HospitalsMeta;
  city: string | null;
  pincode: string | null;
  risk: string | null;
}) {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [currentMeta, setCurrentMeta] = useState(meta);
  const [searchCity, setSearchCity] = useState(city ?? "");
  const [searchPincode, setSearchPincode] = useState(pincode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const withCoords = hospitals.filter((h) => h.lat != null && h.lng != null);
  const center = withCoords.length > 0
    ? { lat: withCoords[0].lat as number, lng: withCoords[0].lng as number }
    : null;

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchCity) params.set("city", searchCity);
      if (searchPincode) params.set("pincode", searchPincode);
      if (risk) params.set("risk", risk);
      const data = await apiFetch<{ hospitals: HospitalCardData[]; meta: HospitalsMeta }>(
        `/api/hospitals/nearby?${params.toString()}`,
      );
      setHospitals(data.hospitals);
      setCurrentMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4" aria-labelledby="hospitals-heading">
      <h2 id="hospitals-heading" className="text-xl font-semibold text-slate-900">
        {t("result.hospitals")}
      </h2>

      {currentMeta.mode === "none" || hospitals.length === 0 ? (
        <form onSubmit={search} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="space-y-1">
            <Label htmlFor="search-city">{t("check.city")}</Label>
            <Input id="search-city" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="search-pincode">{t("check.pincode")}</Label>
            <Input id="search-pincode" value={searchPincode} onChange={(e) => setSearchPincode(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>
            {t("result.findHospitals")}
          </Button>
        </form>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}
      {currentMeta.radiusExpanded ? (
        <Alert tone="info">{t("fields.widerArea").replace("{radius}", String(currentMeta.radiusKm))}</Alert>
      ) : null}

      {center && withCoords.length > 0 ? (
        <HospitalMapDynamic
          center={center}
          showUser={currentMeta.mode === "geo"}
          hospitals={withCoords.map((h, index) => ({
            id: h.id,
            name: h.name,
            lat: h.lat as number,
            lng: h.lng as number,
            rank: index + 1,
          }))}
        />
      ) : null}

      {hospitals.length === 0 ? (
        <p className="text-sm text-slate-600">{t("hospitals.noResults")}</p>
      ) : (
        <ul className="space-y-3">
          {hospitals.map((hospital, index) => (
            <li key={hospital.id}>
              <HospitalCard hospital={hospital} rank={index + 1} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
