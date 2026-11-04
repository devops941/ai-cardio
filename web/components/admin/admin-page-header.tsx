import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[var(--cardiac-100)] bg-white p-6 shadow-[0_1px_2px_rgba(74,2,24,0.04),0_18px_40px_-24px_rgba(222,17,69,0.28)]",
        className,
      )}
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--cardiac-100)]/50 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cardiac-500)] to-[var(--cardiac-800)] text-white shadow-md shadow-[color:rgba(222,17,69,0.3)]">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[var(--ink-900)]">{title}</h1>
            <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-[var(--ink-500)]">
              {subtitle}
            </p>
          </div>
        </div>
        {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
