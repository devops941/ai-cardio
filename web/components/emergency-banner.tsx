import { Phone, ShieldAlert } from "lucide-react";

import { t } from "@/lib/i18n";

export function EmergencyBanner() {
  return (
    <div
      role="alert"
      className="relative overflow-hidden rounded-lg border border-red-700/40 bg-gradient-to-r from-red-600 via-[var(--cardiac-600)] to-red-700 px-5 py-5 text-white sm:px-7"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/20">
            <ShieldAlert aria-hidden className="h-6 w-6 animate-pulse text-white" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                Critical Alert
              </span>
              <p className="text-base font-bold leading-snug sm:text-lg">{t("emergencyBanner")}</p>
            </div>
            <p className="mt-1 hidden text-xs text-red-50 sm:block">
              Do not wait. Severe cardiac symptoms require immediate clinical care.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="tel:108"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-red-700 transition-transform hover:scale-105 active:scale-95"
          >
            <Phone aria-hidden className="h-4 w-4 animate-bounce text-red-600" />
            Call 108 (ambulance)
          </a>
          <a
            href="tel:112"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/20"
          >
            112
          </a>
        </div>
      </div>
    </div>
  );
}
