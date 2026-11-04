"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Delay = 0 | 1 | 2 | 3 | 4 | 5;

const DELAY_CLASS: Record<Delay, string> = {
  0: "",
  1: "reveal-delay-1",
  2: "reveal-delay-2",
  3: "reveal-delay-3",
  4: "reveal-delay-4",
  5: "reveal-delay-5",
};

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: Delay;
  as?: ElementType;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", DELAY_CLASS[delay], visible && "is-visible", className)}
    >
      {children}
    </Tag>
  );
}
