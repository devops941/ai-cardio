"use client";

import { Building2, Hospital, MapPin, Search } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Hospital className="h-4 w-4" />
          </span>
          <h2 id="hospitals-heading" className="text-lg font-bold text-slate-900">
            {t("result.hospitals")}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
          Ranked by proximity & Cath Lab
        </span>
      </div>

      {currentMeta.mode === "none" || hospitals.length === 0 ? (
        <form onSubmit={search} className="space-y-3 rounded-2xl border border-rose-100 bg-white p-4 shadow-xs">
          <p className="text-xs text-slate-600">
            Enter your city or pincode to locate the closest emergency cardiac facilities:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="search-city" className="text-xs">{t("check.city")}</Label>
              <Input
                id="search-city"
                placeholder="e.g. Chennai"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="search-pincode" className="text-xs">{t("check.pincode")}</Label>
              <Input
                id="search-pincode"
                placeholder="e.g. 600001"
                value={searchPincode}
                onChange={(e) => setSearchPincode(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} size="sm" className="w-full gap-2 rounded-xl">
            <Search className="h-4 w-4" />
            {loading ? "Searching..." : t("result.findHospitals")}
          </Button>
        </form>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}
      {currentMeta.radiusExpanded ? (
        <Alert tone="warning">
          {t("fields.widerArea").replace("{radius}", String(currentMeta.radiusKm))}
        </Alert>
      ) : null}

      {center && withCoords.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-rose-100 shadow-xs">
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
        </div>
      ) : null}

      {hospitals.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-xs text-slate-600">{t("hospitals.noResults")}</p>
        </div>
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
