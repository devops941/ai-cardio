"use client";

import {
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
  Phone,
  ShieldAlert,
  Star,
  Stethoscope,
} from "lucide-react";
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

export function HospitalCard({ hospital, rank }: { hospital: HospitalCardData; rank: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="group overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--cardiac-500)] to-[var(--cardiac-800)] text-sm font-black text-white">
              {rank}
            </span>
            <div>
              <h3 className="font-bold leading-snug text-[var(--ink-900)]">{hospital.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--ink-500)]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--cardiac-400)]" />
                {[hospital.address, hospital.city].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          </div>
          {hospital.distanceKm != null ? (
            <span className="shrink-0 rounded-full border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] px-3 py-1 text-xs font-bold text-[var(--cardiac-700)]">
              {hospital.distanceKm.toFixed(1)} {t("hospitals.distance")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hospital.emergency24x7 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] px-2.5 py-0.5 text-xs font-bold text-[var(--cardiac-700)]">
              <Clock className="h-3 w-3" /> 24×7 emergency
            </span>
          ) : null}
          {hospital.hasCathLab ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/60 px-2.5 py-0.5 text-xs font-medium text-[var(--cardiac-800)]">
              <ShieldAlert className="h-3 w-3" /> {t("fields.cathLab")}
            </span>
          ) : null}
          {hospital.hasCardiology ? (
            <Badge tone="green">
              <Stethoscope className="h-3 w-3" /> {t("hospitals.cardiology")}
            </Badge>
          ) : null}
          <Badge tone="amber">
            <Star aria-hidden className="h-3 w-3 fill-amber-400 text-amber-500" />{" "}
            {hospital.rating.toFixed(1)}
          </Badge>
          <Badge tone="slate">
            {hospital.cardiologistCount} {t("hospitals.cardiologists")}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--cardiac-50)] pt-3">
          {hospital.phone ? (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${hospital.phone}`}>
                <Phone aria-hidden className="h-4 w-4 text-[var(--cardiac-600)]" /> {t("hospitals.call")}
              </a>
            </Button>
          ) : null}
          {hospital.directionsUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a href={hospital.directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden className="h-4 w-4 text-[var(--ink-700)]" /> {t("hospitals.directions")}
              </a>
            </Button>
          ) : null}
          {hospital.doctors.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="text-xs"
            >
              {t("hospitals.cardiologists")} ({hospital.doctors.length})
              <ChevronDown
                aria-hidden
                className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </Button>
          ) : null}
        </div>

        {open ? (
          <ul className="space-y-2 rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/50 p-3.5 text-xs text-[var(--ink-700)]">
            {hospital.doctors.map((doctor) => (
              <li key={doctor.id} className="flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 shrink-0 text-[var(--cardiac-500)]" />
                <span className="font-semibold text-[var(--ink-900)]">{doctor.name}</span>
                {doctor.specialization ? (
                  <span className="text-[var(--ink-500)]">· {doctor.specialization}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
