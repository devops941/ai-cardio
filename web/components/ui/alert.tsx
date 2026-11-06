import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type AlertTone = "info" | "warning" | "error" | "success";

const toneStyles: Record<AlertTone, string> = {
  info: "border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/70 text-[var(--cardiac-950)]",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  error: "border-[var(--cardiac-300)] bg-[var(--cardiac-50)] text-[var(--cardiac-950)]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

const toneIcons: Record<AlertTone, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle2,
};

/** ARIA role is assertive ("alert") for error/warning, polite ("status") for info/success. */
function getRole(tone: AlertTone): "alert" | "status" {
  return tone === "error" || tone === "warning" ? "alert" : "status";
}

export function Alert({
  className,
  tone = "info",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  const Icon = toneIcons[tone];
  return (
    <div
      role={getRole(tone)}
      className={cn(
        "flex items-start gap-3 rounded-md border p-4 text-sm leading-relaxed",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 opacity-80" />
      <div>{children}</div>
    </div>
  );
}
