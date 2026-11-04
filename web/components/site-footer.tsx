import Link from "next/link";
import { Activity, AlertCircle, Heart, Phone, ShieldCheck } from "lucide-react";

import { t } from "@/lib/i18n";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rose-100 bg-gradient-to-b from-white to-rose-50/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm shadow-rose-600/30">
                <Heart aria-hidden className="h-4 w-4 animate-heartbeat fill-white/20" />
              </span>
              <span className="text-base font-black tracking-tight text-slate-900">
                Cardio<span className="text-rose-600">Care AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              An educational cardiovascular symptom screening assistant powered by validated clinical decision models and medical retrieval.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Evidence-Grounded RAG Pipeline</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <Link href="/check" className="hover:text-rose-600 transition-colors">
                  Heart Symptom Checker
                </Link>
              </li>
              <li>
                <Link href="/hospitals" className="hover:text-rose-600 transition-colors">
                  Find Cardiac Hospitals
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-rose-600 transition-colors">
                  Patient Dashboard
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-rose-600 transition-colors">
                  Send Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Emergency Contacts */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700">
              Emergency Hotlines
            </p>
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5">
                <p className="font-bold text-red-900 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-red-600" /> Ambulance: 108
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">National Emergency Ambulance Service</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-slate-600" /> Emergency Support: 112
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">All-in-one Emergency Response</p>
              </div>
            </div>
          </div>

          {/* Column 4: Clinical Scope */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Clinical Scope
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed specifically for heart-related symptoms including angina, arrhythmias, dyspnea, and hypertensive risks. Does not analyze ECG waveforms or radiology scans.
            </p>
          </div>
        </div>

        {/* Disclaimer Box */}
        <div className="mt-8 rounded-2xl border border-rose-200/60 bg-rose-50/60 p-4 text-xs text-rose-950/80">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Medical Disclaimer:</strong> {t("disclaimer")} CardioCare AI is strictly an educational screening tool and does not provide a definitive medical diagnosis. In case of severe chest tightness, radiating jaw/arm pain, or breathing difficulty, call 108 or proceed to the nearest emergency room immediately.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/60 pt-6 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} CardioCare AI. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy First (No Health Records Sold)</span>
            <span>•</span>
            <span>Deterministic Red-Flag Guardrails</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
