import Image from "next/image";
import { Activity, Heart, HeartPulse, Lock, ShieldCheck, Stethoscope } from "lucide-react";

import { EcgLine } from "@/components/motion/ecg-line";

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Deterministic guardrails",
    body: "RF-01 → RF-08 emergency rules always escalate first.",
  },
  {
    icon: Activity,
    title: "Cleveland ML model",
    body: "Random Forest inference on 13 clinical markers.",
  },
  {
    icon: Stethoscope,
    title: "Grounded retrieval",
    body: "Every explanation cites curated cardiology sources.",
  },
];

export function AuthShowcase({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <aside className="relative hidden overflow-hidden cardiac-mesh lg:col-span-6 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute inset-0 -z-10">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--cardiac-950)]/92 via-[var(--cardiac-900)]/88 to-[var(--cardiac-950)]/95" />
      </div>

      <div className="relative">
        <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--cardiac-300)]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cardiac-100)] backdrop-blur-md">
          <Heart className="h-3.5 w-3.5 animate-heartbeat fill-white/25 text-[var(--cardiac-300)]" />
          {eyebrow}
        </span>
        <h2 className="mt-7 text-balance text-4xl font-black leading-tight tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--cardiac-100)]/85">{body}</p>
      </div>

      <div className="relative my-10 opacity-70">
        <EcgLine color="#fb6482" strokeWidth={2} className="h-16" />
      </div>

      <div className="relative space-y-3">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cardiac-600)]/30 text-[var(--cardiac-100)]">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--cardiac-200)]/80">
                {item.body}
              </p>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-[11px] font-semibold text-[var(--cardiac-200)]/80">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> bcrypt + TLS encryption
          </span>
          <span className="flex items-center gap-1.5">
            <HeartPulse className="h-3.5 w-3.5" /> 96.4% screening recall
          </span>
        </div>
      </div>
    </aside>
  );
}
