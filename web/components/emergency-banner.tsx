import { Phone } from "lucide-react";

import { t } from "@/lib/i18n";

export function EmergencyBanner() {
  return (
    <div role="alert" className="w-full bg-red-600 px-4 py-3 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-base font-semibold sm:text-lg">{t("emergencyBanner")}</p>
        <a
          href="tel:108"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
        >
          <Phone aria-hidden className="h-5 w-5" />
          {t("callAmbulance")}
        </a>
      </div>
    </div>
  );
}
