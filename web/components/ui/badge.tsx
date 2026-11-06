import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "slate",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "slate" | "blue" | "green" | "amber" | "red" | "rose" | "cardiac";
}) {
  const tones: Record<string, string> = {
    slate: "bg-[var(--ink-100)] text-[var(--ink-700)] border border-[var(--ink-300)]/40",
    blue: "bg-[var(--cardiac-50)] text-[var(--cardiac-800)] border border-[var(--cardiac-200)]",
    rose: "bg-[var(--cardiac-50)] text-[var(--cardiac-800)] border border-[var(--cardiac-200)]",
    cardiac: "bg-[var(--cardiac-50)] text-[var(--cardiac-800)] border border-[var(--cardiac-200)]",
    green: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    amber: "bg-amber-50 text-amber-900 border border-amber-200",
    red: "bg-[var(--cardiac-100)] text-[var(--cardiac-900)] border border-[var(--cardiac-300)] font-semibold",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone] ?? tones.slate,
        className,
      )}
      {...props}
    />
  );
}
