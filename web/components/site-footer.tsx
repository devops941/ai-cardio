import { t } from "@/lib/i18n";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-6xl text-sm text-slate-600">
        <p className="font-medium text-slate-800">{t("disclaimer")}</p>
        <p className="mt-2">
          {t("appName")} · Emergency: 108 (ambulance) / 112
        </p>
      </div>
    </footer>
  );
}
