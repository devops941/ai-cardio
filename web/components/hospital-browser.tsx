"use client";

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
      setError("Enter a city or pincode.");
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
    <div className="space-y-5">
      <form onSubmit={search} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="space-y-1">
          <Label htmlFor="city">{t("check.city")}</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pincode">{t("check.pincode")}</Label>
          <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="cardiology" checked={cardiology} onChange={(e) => setCardiology(e.target.checked)} />
          <Label htmlFor="cardiology" className="font-normal">{t("hospitals.cardiology")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="emergency" checked={emergency} onChange={(e) => setEmergency(e.target.checked)} />
          <Label htmlFor="emergency" className="font-normal">{t("hospitals.emergency24x7")}</Label>
        </div>
        <Button type="submit" disabled={loading}>
          {t("admin.search")}
        </Button>
      </form>

      {error ? <Alert tone="error">{error}</Alert> : null}
      {loading ? <Skeleton className="h-40 w-full" /> : null}

      {rows && rows.length === 0 && !loading ? (
        <p className="text-sm text-slate-600">{t("hospitals.noResults")}</p>
      ) : null}

      {center ? (
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
      ) : null}

      {rows && rows.length > 0 ? (
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
      ) : null}
    </div>
  );
}
