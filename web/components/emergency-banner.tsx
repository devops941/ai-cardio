import { AlertTriangle, Phone, ShieldAlert } from "lucide-react";

import { t } from "@/lib/i18n";

export function EmergencyBanner() {
  return (
    <div
      role="alert"
      className="relative overflow-hidden border-b-2 border-red-700 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 py-3.5 text-white shadow-lg shadow-red-700/20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm animate-pulse">
            <ShieldAlert aria-hidden className="h-6 w-6 text-white" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white">
                CRITICAL ALERT
              </span>
              <p className="text-sm font-bold sm:text-base leading-snug">
                {t("emergencyBanner")}
              </p>
            </div>
            <p className="text-xs text-red-100 hidden sm:block">
              Do not wait. Severe cardiac symptoms require immediate clinical care.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:108"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-red-700 shadow-md transition-all hover:bg-rose-50 hover:scale-105 active:scale-95"
          >
            <Phone aria-hidden className="h-4 w-4 text-red-600 animate-bounce" />
            <span>Call 108 (Ambulance)</span>
          </a>
          <a
            href="tel:112"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-3.5 py-2 text-sm font-bold text-white transition-all hover:bg-white/20"
          >
            <span>112</span>
          </a>
        </div>
      </div>
    </div>
  );
}
