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
        "rounded-lg border border-[var(--cardiac-100)] bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[var(--cardiac-500)] to-[var(--cardiac-800)] text-white">
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
