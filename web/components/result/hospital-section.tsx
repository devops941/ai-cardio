"use client";

import { Building2, Hospital, Search } from "lucide-react";
import { useState } from "react";

import { HospitalCard, type HospitalCardData } from "@/components/hospital-list";
import { HospitalMapDynamic } from "@/components/map/hospital-map-dynamic";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const center =
    withCoords.length > 0
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
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cardiac-50)] text-[var(--cardiac-600)]">
                <Hospital className="h-5 w-5" />
              </span>
              <div>
                <h2 id="hospitals-heading" className="text-sm font-bold text-[var(--ink-900)]">
                  {t("result.hospitals")}
                </h2>
                <p className="text-[11px] text-[var(--ink-500)]">
                  Ranked by proximity &amp; cath-lab readiness
                </p>
              </div>
            </div>
            {currentMeta.urgent ? (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-700">
                Urgent
              </span>
            ) : null}
          </div>

          {currentMeta.mode === "none" || hospitals.length === 0 ? (
            <form onSubmit={search} className="space-y-3 border-t border-[var(--cardiac-100)] pt-4">
              <p className="text-xs text-[var(--ink-500)]">
                Enter your city or pincode to locate the closest emergency cardiac facilities:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="search-city" className="text-xs">
                    {t("check.city")}
                  </Label>
                  <Input
                    id="search-city"
                    placeholder="e.g. Chennai"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="search-pincode" className="text-xs">
                    {t("check.pincode")}
                  </Label>
                  <Input
                    id="search-pincode"
                    placeholder="e.g. 600001"
                    value={searchPincode}
                    onChange={(e) => setSearchPincode(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} size="sm" className="w-full">
                <Search className="h-4 w-4" />
                {loading ? "Searching..." : t("result.findHospitals")}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {currentMeta.radiusExpanded ? (
        <Alert tone="warning">
          {t("fields.widerArea", { radius: currentMeta.radiusKm })}
        </Alert>
      ) : null}

      {center && withCoords.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-[var(--cardiac-100)] shadow-sm">
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
        <div className="rounded-md border border-dashed border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-[var(--cardiac-400)]" />
          <p className="mt-2 text-xs text-[var(--ink-500)]">{t("hospitals.noResults")}</p>
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
