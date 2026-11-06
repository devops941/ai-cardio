import * as React from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={cn(
        "relative overflow-hidden rounded-md bg-[var(--cardiac-100)]/60",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 shimmer-bar" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  );
}
