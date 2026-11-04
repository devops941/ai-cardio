import * as React from "react";

import { cn } from "@/lib/utils";

export function Alert({
  className,
  tone = "info",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "info" | "warning" | "error" | "success" }) {
  const tones: Record<string, string> = {
    info: "border-rose-200/80 bg-rose-50/50 text-rose-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    error: "border-rose-300 bg-rose-50 text-rose-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };
  return (
    <div
      role="status"
      className={cn("rounded-xl border p-4 text-sm leading-relaxed shadow-xs", tones[tone], className)}
      {...props}
    />
  );
}
