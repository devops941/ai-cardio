"use client";

import { ChevronDown, Navigation, Phone, Star } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export interface HospitalCardDoctor {
  id: string;
  name: string;
  specialization: string | null;
}

export interface HospitalCardData {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
  emergency24x7: boolean;
  hasCardiology: boolean;
  hasCathLab: boolean;
  rating: number;
  cardiologistCount: number;
  doctors: HospitalCardDoctor[];
  directionsUrl: string | null;
}

export function HospitalCard({
  hospital,
  rank,
}: {
  hospital: HospitalCardData;
  rank: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                {rank}
              </span>
              {hospital.name}
            </h3>
            <p className="text-sm text-slate-600">
              {[hospital.address, hospital.city].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
          {hospital.distanceKm != null ? (
            <span className="whitespace-nowrap text-sm font-medium text-slate-700">
              {hospital.distanceKm.toFixed(1)} {t("hospitals.distance")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {hospital.emergency24x7 ? <Badge tone="red">24×7</Badge> : null}
          {hospital.hasCathLab ? <Badge tone="blue">{t("fields.cathLab")}</Badge> : null}
          {hospital.hasCardiology ? <Badge tone="green">{t("hospitals.cardiology")}</Badge> : null}
          <Badge tone="amber">
            <Star aria-hidden className="h-3 w-3" /> {hospital.rating.toFixed(1)}
          </Badge>
          <Badge tone="slate">
            {hospital.cardiologistCount} {t("hospitals.cardiologists")}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {hospital.phone ? (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${hospital.phone}`}>
                <Phone aria-hidden className="h-4 w-4" /> {t("hospitals.call")}
              </a>
            </Button>
          ) : null}
          {hospital.directionsUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a href={hospital.directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden className="h-4 w-4" /> {t("hospitals.directions")}
              </a>
            </Button>
          ) : null}
          {hospital.doctors.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {t("hospitals.cardiologists")}
              <ChevronDown aria-hidden className={open ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
            </Button>
          ) : null}
        </div>

        {open ? (
          <ul className="space-y-1 border-t border-slate-100 pt-2 text-sm text-slate-700">
            {hospital.doctors.map((doctor) => (
              <li key={doctor.id}>
                {doctor.name}
                {doctor.specialization ? ` · ${doctor.specialization}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
