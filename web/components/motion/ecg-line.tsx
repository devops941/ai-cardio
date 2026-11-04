import { cn } from "@/lib/utils";

/**
 * Decorative ECG waveform. The path is a repeating P-QRS-T complex that reads as
 * a continuous cardiac trace across any width.
 */
export function EcgLine({
  className,
  color = "currentColor",
  strokeWidth = 2,
  animated = true,
}: {
  className?: string;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
}) {
  const beat =
    "M0,40 L40,40 L52,40 L60,24 L70,56 L80,40 L120,40 L132,40 L140,24 L150,56 L160,40 L200,40";
  return (
    <svg
      className={cn("w-full", className)}
      viewBox="0 0 200 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ecg-fade" x1="0" x2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="18%" stopColor={color} stopOpacity="1" />
          <stop offset="82%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={beat}
        fill="none"
        stroke="url(#ecg-fade)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? "animate-heartbeat" : undefined}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  );
}

/** Full-width repeating ECG strip used as a section divider. */
export function EcgStrip({
  className,
  color = "var(--cardiac-400)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={cn("relative h-16 w-full overflow-hidden", className)} aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-[200%] animate-marquee"
        viewBox="0 0 800 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 L60,40 L72,40 L80,22 L92,58 L102,40 L160,40 L172,40 L180,22 L192,58 L202,40 L260,40 L272,40 L280,22 L292,58 L302,40 L360,40 L372,40 L380,22 L392,58 L402,40 L460,40 L472,40 L480,22 L492,58 L502,40 L560,40 L572,40 L580,22 L592,58 L602,40 L660,40 L672,40 L680,22 L692,58 L702,40 L800,40"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--background)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--background)] to-transparent" />
    </div>
  );
}
