import { Activity, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

import { CheckWizard } from "@/components/check/check-wizard";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ASSURANCES = [
  { icon: ShieldCheck, text: "Deterministic emergency rules" },
  { icon: Activity, text: "Cleveland ML inference" },
  { icon: Sparkles, text: "Grounded explanations" },
];

export default async function CheckPage() {
  await requireUser();
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cardiac-700)]">
          <HeartPulse className="h-3.5 w-3.5 animate-heartbeat" />
          Guided Cardiac Screening
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--ink-900)] sm:text-4xl">
          Heart Symptom &amp; Risk Assessment
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-500)]">
          Four guided steps, under two minutes. Your answers drive deterministic emergency triage,
          machine-learning risk inference, and ranked nearby cardiac hospitals.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[var(--ink-500)]">
          {ASSURANCES.map((item) => (
            <span key={item.text} className="flex items-center gap-1.5">
              <item.icon className="h-3.5 w-3.5 text-[var(--cardiac-500)]" />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <CheckWizard />
    </div>
  );
}
