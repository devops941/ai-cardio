import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "slate",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "slate" | "blue" | "green" | "amber" | "red" | "rose" }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-800 border border-slate-200/60",
    blue: "bg-rose-50 text-rose-800 border border-rose-200/60", // Map legacy blue to cardiac rose
    rose: "bg-rose-50 text-rose-800 border border-rose-200/60",
    green: "bg-emerald-50 text-emerald-800 border border-emerald-200/60",
    amber: "bg-amber-50 text-amber-900 border border-amber-200/60",
    red: "bg-rose-100 text-rose-900 border border-rose-300 font-semibold",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide shadow-xs",
        tones[tone] ?? tones.slate,
        className,
      )}
      {...props}
    />
  );
}
