import { AlertTriangle, CheckCircle2, OctagonAlert } from "lucide-react";

import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Risk = "LOW" | "MODERATE" | "HIGH";

const STYLES: Record<Risk, { wrap: string; icon: typeof CheckCircle2 }> = {
  LOW: { wrap: "bg-green-100 text-green-900 border-green-300", icon: CheckCircle2 },
  MODERATE: { wrap: "bg-amber-100 text-amber-900 border-amber-300", icon: AlertTriangle },
  HIGH: { wrap: "bg-red-100 text-red-900 border-red-300", icon: OctagonAlert },
};

export function RiskBadge({ risk, className }: { risk: Risk | null; className?: string }) {
  if (!risk) {
    return (
      <span className={cn("inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700", className)}>
        {t("risk.UNKNOWN") === "risk.UNKNOWN" ? "UNKNOWN" : t("risk.UNKNOWN")}
      </span>
    );
  }
  const { wrap, icon: Icon } = STYLES[risk];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold",
        wrap,
        className,
      )}
    >
      <Icon aria-hidden className="h-4 w-4" />
      {t(`riskBadge.${risk}`)}
    </span>
  );
}
