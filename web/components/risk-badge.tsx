import { AlertTriangle, CheckCircle2, OctagonAlert, ShieldCheck } from "lucide-react";

import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Risk = "LOW" | "MODERATE" | "HIGH";

const STYLES: Record<Risk, { wrap: string; icon: typeof CheckCircle2; pulse?: boolean }> = {
  LOW: {
    wrap: "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs",
    icon: ShieldCheck,
  },
  MODERATE: {
    wrap: "bg-amber-50 text-amber-900 border-amber-200 shadow-xs",
    icon: AlertTriangle,
  },
  HIGH: {
    wrap: "bg-red-50 text-red-900 border-red-300 shadow-sm animate-pulse-glow",
    icon: OctagonAlert,
    pulse: true,
  },
};

export function RiskBadge({ risk, className }: { risk: Risk | null; className?: string }) {
  if (!risk) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700",
          className,
        )}
      >
        {t("risk.UNKNOWN") === "risk.UNKNOWN" ? "NOT ASSESSED" : t("risk.UNKNOWN")}
      </span>
    );
  }
  const { wrap, icon: Icon, pulse } = STYLES[risk];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide uppercase",
        wrap,
        className,
      )}
    >
      <Icon aria-hidden className={cn("h-4 w-4 shrink-0", pulse && "text-red-600 animate-pulse")} />
      <span>{t(`riskBadge.${risk}`)}</span>
    </span>
  );
}
