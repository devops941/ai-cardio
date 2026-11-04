import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-[var(--cardiac-100)] bg-white/95 shadow-[0_1px_2px_rgba(74,2,24,0.04),0_18px_40px_-24px_rgba(222,17,69,0.28)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--cardiac-200)] hover:shadow-[0_2px_6px_rgba(74,2,24,0.05),0_28px_56px_-26px_rgba(222,17,69,0.35)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 border-b border-[var(--cardiac-50)] px-6 py-5", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-xl font-bold tracking-tight text-[var(--ink-900)]", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-relaxed text-[var(--ink-500)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 border-t border-[var(--cardiac-50)] px-6 py-4", className)}
      {...props}
    />
  );
}
