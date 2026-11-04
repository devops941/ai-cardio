"use client";

import { ChevronDown, MapPin, Navigation, Phone, Star, Stethoscope, Clock, ShieldAlert } from "lucide-react";
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
    <Card className="overflow-hidden border border-rose-100/80 bg-white shadow-xs transition-all duration-300 hover:border-rose-300 hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 text-xs font-bold text-white shadow-xs">
              {rank}
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 leading-snug">
                {hospital.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {[hospital.address, hospital.city].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          </div>
          {hospital.distanceKm != null ? (
            <span className="shrink-0 rounded-full border border-rose-200/60 bg-rose-50/60 px-2.5 py-1 text-xs font-semibold text-rose-700">
              {hospital.distanceKm.toFixed(1)} {t("hospitals.distance")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hospital.emergency24x7 ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
              <Clock className="h-3 w-3" /> 24×7 Emergency
            </span>
          ) : null}
          {hospital.hasCathLab ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50/50 px-2.5 py-0.5 text-xs font-medium text-rose-800">
              <ShieldAlert className="h-3 w-3" /> {t("fields.cathLab")}
            </span>
          ) : null}
          {hospital.hasCardiology ? (
            <Badge tone="green">
              <Stethoscope className="h-3 w-3" /> {t("hospitals.cardiology")}
            </Badge>
          ) : null}
          <Badge tone="amber">
            <Star aria-hidden className="h-3 w-3 fill-amber-400 text-amber-500" /> {hospital.rating.toFixed(1)}
          </Badge>
          <Badge tone="slate">
            {hospital.cardiologistCount} {t("hospitals.cardiologists")}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          {hospital.phone ? (
            <Button variant="outline" size="sm" asChild className="rounded-xl border-rose-200 hover:bg-rose-50 hover:text-rose-700">
              <a href={`tel:${hospital.phone}`}>
                <Phone aria-hidden className="h-4 w-4 text-rose-600" /> {t("hospitals.call")}
              </a>
            </Button>
          ) : null}
          {hospital.directionsUrl ? (
            <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200 hover:border-rose-300">
              <a href={hospital.directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden className="h-4 w-4 text-slate-700" /> {t("hospitals.directions")}
              </a>
            </Button>
          ) : null}
          {hospital.doctors.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            >
              {t("hospitals.cardiologists")} ({hospital.doctors.length})
              <ChevronDown aria-hidden className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </Button>
          ) : null}
        </div>

        {open ? (
          <ul className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-700">
            {hospital.doctors.map((doctor) => (
              <li key={doctor.id} className="flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="font-medium text-slate-900">{doctor.name}</span>
                {doctor.specialization ? <span className="text-slate-500">· {doctor.specialization}</span> : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
