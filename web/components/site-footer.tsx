import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { EcgStrip } from "@/components/motion/ecg-line";
import { t } from "@/lib/i18n";

const PLATFORM_LINKS = [
  { href: "/check", label: "Heart Symptom Checker" },
  { href: "/hospitals", label: "Find Cardiac Hospitals" },
  { href: "/dashboard", label: "Patient Dashboard" },
  { href: "/history", label: "Assessment History" },
  { href: "/feedback", label: "Send Feedback" },
];

const CLINICAL_LINKS = [
  { label: "ACC / AHA Guidelines", href: "https://www.ahajournals.org" },
  { label: "ESC Cardiology Standards", href: "https://www.escardio.org" },
  { label: "Cleveland Heart Dataset" },
  { label: "Deterministic Red-Flag Rules" },
  { label: "RAG Knowledge Retrieval" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-[var(--cardiac-100)] bg-gradient-to-b from-white to-[var(--cardiac-50)]/60">
      <EcgStrip className="opacity-40" />

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-10">
        <div className="grid gap-10 pt-4 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-[var(--cardiac-600)] to-[var(--cardiac-900)]">
                <Heart aria-hidden className="h-5 w-5 animate-heartbeat fill-white/25 text-white" />
              </span>
              <span className="text-lg font-black tracking-tight text-[var(--ink-900)]">
                Cardio<span className="text-[var(--cardiac-600)]">Care AI</span>
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-500)]">
              An educational cardiovascular symptom-screening assistant combining validated
              clinical decision models with grounded medical retrieval.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Evidence-Grounded RAG Pipeline
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-3 lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-900)]">
              Platform
            </p>
            <ul className="space-y-2.5 text-sm text-[var(--ink-500)]">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-[var(--cardiac-600)]"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency */}
          <div className="space-y-3 lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">
              Emergency
            </p>
            <div className="space-y-2.5">
              <a
                href="tel:108"
                className="block rounded-md border border-red-200 bg-red-50 p-3 transition-colors hover:border-red-300"
              >
                <p className="flex items-center gap-1.5 text-sm font-bold text-red-900">
                  <Phone className="h-3.5 w-3.5 text-red-600" /> Ambulance · 108
                </p>
                <p className="mt-0.5 text-[11px] text-red-700">National emergency ambulance</p>
              </a>
              <a
                href="tel:112"
                className="block rounded-md border border-[var(--cardiac-200)] bg-white p-3 transition-colors hover:border-[var(--cardiac-300)]"
              >
                <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink-900)]">
                  <Activity className="h-3.5 w-3.5 text-[var(--cardiac-600)]" /> All-in-one · 112
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--ink-500)]">Unified emergency response</p>
              </a>
            </div>
          </div>

          {/* Clinical */}
          <div className="space-y-3 lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-900)]">
              Clinical Basis
            </p>
            <ul className="space-y-2 text-xs text-[var(--ink-500)]">
              {CLINICAL_LINKS.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0 text-[var(--cardiac-400)]" />
                  {"href" in item ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-[var(--cardiac-600)] underline-offset-2 hover:underline"
                    >
                      {item.label}
                    </a>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-md border border-[var(--cardiac-200)]/70 bg-white/80 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cardiac-600)]" />
            <p className="text-xs leading-relaxed text-[var(--ink-700)]">
              <strong className="font-bold text-[var(--ink-900)]">Medical Disclaimer:</strong>{" "}
              {t("disclaimer")} CardioCare AI is strictly an educational screening tool and does
              not provide a definitive diagnosis. For severe chest tightness, radiating jaw or arm
              pain, or breathing difficulty, call 108 or go to the nearest emergency department
              immediately.
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-6 flex flex-col gap-4 border-t border-[var(--cardiac-100)] pt-6 text-[11px] text-[var(--ink-500)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CardioCare AI. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--cardiac-400)]" />
              GPS-based cardiac facility ranking
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[var(--cardiac-400)]" />
              Privacy-first · health data never sold
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
