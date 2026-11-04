import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[var(--cardiac-100)]/60",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 shimmer-bar" />
    </div>
  );
}
