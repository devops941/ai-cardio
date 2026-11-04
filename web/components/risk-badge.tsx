import { AlertTriangle, CheckCircle2, OctagonAlert, ShieldCheck } from "lucide-react";

import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Risk = "LOW" | "MODERATE" | "HIGH";

const STYLES: Record<Risk, { wrap: string; icon: typeof CheckCircle2; pulse?: boolean }> = {
  LOW: {
    wrap: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: ShieldCheck,
  },
  MODERATE: {
    wrap: "bg-amber-50 text-amber-900 border-amber-200",
    icon: AlertTriangle,
  },
  HIGH: {
    wrap: "bg-[var(--cardiac-100)] text-[var(--cardiac-900)] border-[var(--cardiac-300)] animate-pulse-glow",
    icon: OctagonAlert,
    pulse: true,
  },
};

export function RiskBadge({ risk, className }: { risk: Risk | null; className?: string }) {
  if (!risk) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-[var(--ink-100)] bg-[var(--ink-50)] px-3.5 py-1 text-xs font-semibold text-[var(--ink-700)]",
          className,
        )}
      >
        NOT ASSESSED
      </span>
    );
  }
  const { wrap, icon: Icon, pulse } = STYLES[risk];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wide",
        wrap,
        className,
      )}
    >
      <Icon aria-hidden className={cn("h-4 w-4 shrink-0", pulse && "text-[var(--cardiac-600)] animate-pulse")} />
      <span>{t(`riskBadge.${risk}`)}</span>
    </span>
  );
}
