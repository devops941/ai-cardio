"use client";

import { Building2, Filter, MapPin, Search } from "lucide-react";
import { useState } from "react";

import { HospitalCard, type HospitalCardData } from "@/components/hospital-list";
import { HospitalMapDynamic } from "@/components/map/hospital-map-dynamic";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface HospitalRow extends HospitalCardData {
  rating: number;
}

export function HospitalBrowser({ initialCity }: { initialCity: string }) {
  const [city, setCity] = useState(initialCity);
  const [pincode, setPincode] = useState("");
  const [cardiology, setCardiology] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [rows, setRows] = useState<HospitalRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!city && !pincode) {
      setError("Please enter a city name or postal pincode.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (pincode) params.set("pincode", pincode);
      if (cardiology) params.set("cardiology", "true");
      if (emergency) params.set("emergency", "true");
      const data = await apiFetch<{ items: HospitalRow[] }>(`/api/hospitals?${params.toString()}`);
      setRows(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  const withCoords = (rows ?? []).filter((h) => h.lat != null && h.lng != null);
  const center = withCoords.length > 0
    ? { lat: withCoords[0].lat as number, lng: withCoords[0].lng as number }
    : null;

  return (
    <div className="space-y-6">
      <form onSubmit={search} className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs transition-all">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="h-4 w-4 text-rose-600" />
          Filter Cardiac Facilities
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-medium text-slate-700">
              {t("check.city")}
            </Label>
            <div className="relative">
              <Input
                id="city"
                placeholder="e.g. Chennai, Coimbatore..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-9"
              />
              <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pincode" className="text-xs font-medium text-slate-700">
              {t("check.pincode")}
            </Label>
            <Input
              id="pincode"
              placeholder="e.g. 600001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2.5 sm:col-span-2 lg:col-span-1 justify-center py-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <Checkbox id="cardiology" checked={cardiology} onChange={(e) => setCardiology(e.target.checked)} />
              <span>{t("hospitals.cardiology")} Unit</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <Checkbox id="emergency" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} />
              <span>{t("hospitals.emergency24x7")}</span>
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <Button type="submit" disabled={loading} className="w-full gap-2 rounded-xl">
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : t("admin.search")}
            </Button>
          </div>
        </div>
      </form>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : null}

      {rows && rows.length === 0 && !loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Building2 className="mx-auto h-10 w-10 text-slate-400" />
          <h4 className="mt-3 font-semibold text-slate-900">No Hospitals Found</h4>
          <p className="mt-1 text-sm text-slate-500">{t("hospitals.noResults")}</p>
        </div>
      ) : null}

      {center ? (
        <div className="overflow-hidden rounded-2xl border border-rose-100 shadow-xs">
          <HospitalMapDynamic
            center={center}
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

      {rows && rows.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {rows.length} verified cardiac centers</span>
            <span>Sorted by clinical readiness & proximity</span>
          </div>
          <ul className="space-y-3">
            {rows.map((hospital, index) => (
              <li key={hospital.id}>
                <HospitalCard
                  hospital={{ ...hospital, distanceKm: hospital.distanceKm ?? null }}
                  rank={index + 1}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
