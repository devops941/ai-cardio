"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const N = 7;
const CENTER = (N - 1) / 2; // 3
const MASK_RADIUS = 3.2;
const CYCLE_MS = 1400;

function dotOpacity(radius: number, pulse: number): number {
  let opacity: number;
  if (radius < 0.55) {
    opacity = 0.35 + pulse * 0.95;
  } else if (radius < 1.65) {
    opacity = 0.16 + pulse * 0.44;
  } else {
    opacity = 0.08 + pulse * 0.08;
  }
  return Math.min(1, Math.max(0, opacity));
}

function staticOpacity(radius: number): number {
  if (radius < 0.55) return 0.8;
  if (radius < 1.65) return 0.35;
  return 0.12;
}

export function HeartPulseLoader({
  size = 56,
  dotSize,
  className,
}: {
  size?: number;
  dotSize?: number;
  className?: string;
}) {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion.current) {
      // Static state — no animation loop
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      setPhase((elapsed % CYCLE_MS) / CYCLE_MS);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Compute pulse scalar from current phase
  const beat = Math.max(0, Math.sin(phase * 2 * Math.PI));
  const spike = Math.max(0, Math.sin(phase * 4 * Math.PI)) * 0.55;
  const pulse = beat + spike;

  // Dot sizing: derive from size prop if not explicitly provided
  const resolvedDotSize = dotSize ?? Math.max(4, Math.round(size / 10));
  const gap = Math.max(2, Math.round(size / 14));
  const totalGrid = N * resolvedDotSize + (N - 1) * gap;

  const isReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${N}, ${resolvedDotSize}px)`,
          gap,
          width: totalGrid,
          height: totalGrid,
        }}
      >
        {Array.from({ length: N * N }).map((_, idx) => {
          const row = Math.floor(idx / N);
          const col = idx % N;
          const x = col - CENTER;
          const y = row - CENTER;
          const radius = Math.hypot(x, y);

          if (radius > MASK_RADIUS) {
            // Outside circular mask — render invisible placeholder to preserve grid
            return (
              <div
                key={idx}
                style={{
                  width: resolvedDotSize,
                  height: resolvedDotSize,
                  opacity: 0,
                  borderRadius: "50%",
                }}
              />
            );
          }

          const opacity = isReduced
            ? staticOpacity(radius)
            : dotOpacity(radius, pulse);

          return (
            <div
              key={idx}
              style={{
                width: resolvedDotSize,
                height: resolvedDotSize,
                borderRadius: "50%",
                backgroundColor: "var(--cardiac-600)",
                opacity,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
