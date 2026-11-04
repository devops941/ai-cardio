import * as React from "react";

import { cn } from "@/lib/utils";

export function Alert({
  className,
  tone = "info",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "info" | "warning" | "error" | "success" }) {
  const tones: Record<string, string> = {
    info: "border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/70 text-[var(--cardiac-950)]",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    error: "border-[var(--cardiac-300)] bg-[var(--cardiac-50)] text-[var(--cardiac-950)]",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border p-4 text-sm leading-relaxed shadow-[0_1px_2px_rgba(74,2,24,0.04)]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
