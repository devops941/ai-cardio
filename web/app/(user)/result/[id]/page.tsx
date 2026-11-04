import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Heart,
  HeartPulse,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { EmergencyBanner } from "@/components/emergency-banner";
import { Reveal } from "@/components/motion/reveal";
import { HospitalSection } from "@/components/result/hospital-section";
import { ReportActions } from "@/components/result/report-actions";
import { RiskBadge } from "@/components/risk-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import {
  DISCLAIMER,
  INSUFFICIENT_KNOWLEDGE_MESSAGE,
  LLM_FALLBACK_MESSAGE,
  NON_HEART_MESSAGE,
} from "@/lib/constants";
import { findRankedHospitals } from "@/lib/hospitals";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Condition {
  name: string;
  why: string;
}

const RISK_GRADIENT: Record<string, string> = {
  LOW: "from-emerald-500 via-emerald-400 to-emerald-600",
  MODERATE: "from-amber-500 via-amber-400 to-amber-600",
  HIGH: "from-[var(--cardiac-500)] via-[var(--cardiac-600)] to-[var(--cardiac-800)]",
};

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const record = await prisma.prediction.findFirst({ where: { id, userId: user.id } });
  if (!record) notFound();

  const urgent = record.urgent || record.emergency;
  const hospitalResult =
    record.status === "non_heart" && !record.emergency
      ? { hospitals: [], meta: { mode: "none" as const, radiusKm: 25, radiusExpanded: false, urgent } }
      : await findRankedHospitals({
          lat: record.latitude,
          lng: record.longitude,
          city: record.city,
          pincode: record.pincode,
          urgent,
        });

  const conditions = (record.possibleConditions as Condition[] | null) ?? [];
  const risk = (record.finalRisk as "LOW" | "MODERATE" | "HIGH" | null) ?? null;
  const mlProb = record.mlProbability != null ? Math.round(record.mlProbability * 100) : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {record.emergency ? <EmergencyBanner /> : null}

      {/* Header */}
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--cardiac-100)] bg-white p-6 shadow-[0_1px_2px_rgba(74,2,24,0.04),0_18px_40px_-24px_rgba(222,17,69,0.28)] sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--cardiac-100)]/50 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cardiac-50)] text-[var(--cardiac-600)]">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--cardiac-600)]">
                  Clinical Assessment Report
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--ink-900)]">
                Cardiovascular Risk Diagnostic
              </h1>
              <p className="mt-1.5 text-xs text-[var(--ink-500)]">
                Assessment ID:{" "}
                <span className="font-mono font-semibold text-[var(--ink-700)]">
                  {record.id.slice(-8)}
                </span>{" "}
                · Evaluated on{" "}
                {new Date(record.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <ReportActions />
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Risk core */}
          <Reveal>
            <Card className="overflow-hidden">
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${RISK_GRADIENT[risk ?? "MODERATE"]}`}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-[var(--cardiac-600)]" />
                    Stratified Risk Assessment
                  </CardTitle>
                  <RiskBadge risk={risk} />
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {record.status !== "non_heart" ? (
                  <div className="grid gap-4 rounded-2xl border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--ink-500)]">
                          ML model probability
                        </span>
                        <span className="font-black text-[var(--ink-900)]">
                          {mlProb != null ? `${mlProb}%` : "Rule-based"}
                        </span>
                      </div>
                      {mlProb != null ? (
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--cardiac-100)]">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              mlProb > 65
                                ? "bg-gradient-to-r from-[var(--cardiac-500)] to-[var(--cardiac-700)]"
                                : mlProb > 35
                                  ? "bg-gradient-to-r from-amber-400 to-amber-600"
                                  : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                            }`}
                            style={{ width: `${mlProb}%` }}
                          />
                        </div>
                      ) : null}
                      <p className="text-[11px] text-[var(--ink-500)]">
                        Trained on the Cleveland Clinic cardiovascular cohort
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-[var(--ink-500)]">
                        Clinical fusion risk
                      </span>
                      <div className="flex items-center gap-2 text-base font-bold text-[var(--ink-900)]">
                        <Heart className="h-4 w-4 animate-heartbeat text-[var(--cardiac-600)]" />
                        <span>{record.llmRisk ?? risk ?? "Indeterminate"}</span>
                      </div>
                      <p className="text-[11px] text-[var(--ink-500)]">
                        Synthesized with RAG knowledge &amp; red-flag rules
                      </p>
                    </div>
                  </div>
                ) : null}

                {record.status === "non_heart" ? (
                  <Alert tone="info">
                    <p>{NON_HEART_MESSAGE}</p>
                    <Button className="mt-3" size="sm" asChild>
                      <Link href="/check">{t("result.newCheck")}</Link>
                    </Button>
                  </Alert>
                ) : null}

                {record.status === "insufficient_knowledge" ? (
                  <Alert tone="info">{INSUFFICIENT_KNOWLEDGE_MESSAGE}</Alert>
                ) : null}

                {record.status === "llm_unavailable" ? (
                  <Alert tone="warning">{LLM_FALLBACK_MESSAGE}</Alert>
                ) : null}

                <div className="flex items-start gap-2 text-[11px] leading-relaxed text-[var(--ink-500)]">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cardiac-500)]" />
                  <span>{t("aiNotice")}</span>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Conditions */}
          {conditions.length > 0 ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Stethoscope className="h-4 w-4 text-[var(--cardiac-600)]" />
                    {t("result.conditions")}
                  </CardTitle>
                  <p className="text-xs text-[var(--ink-500)]">
                    Differential diagnostic possibilities correlated with reported symptoms
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conditions.map((condition, idx) => (
                    <div
                      key={condition.name}
                      className="flex items-start gap-3.5 rounded-2xl border border-[var(--cardiac-100)] bg-white p-4 transition-all hover:border-[var(--cardiac-300)] hover:shadow-sm"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[var(--cardiac-50)] text-xs font-black text-[var(--cardiac-600)]">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[var(--ink-900)]">{condition.name}</p>
                        <p className="text-xs leading-relaxed text-[var(--ink-500)]">
                          {condition.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Explanation */}
          {record.explanation ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-[var(--cardiac-600)]" />
                    {t("result.explanation")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-5 text-sm leading-relaxed text-[var(--ink-700)]">
                    {record.explanation}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Specialist */}
          {record.recommendedSpecialist ? (
            <Reveal>
              <Card className="border-[var(--cardiac-200)] bg-gradient-to-br from-white to-[var(--cardiac-50)]/60">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cardiac-500)] to-[var(--cardiac-800)] text-white shadow-md shadow-[color:rgba(222,17,69,0.3)]">
                    <Stethoscope className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--cardiac-700)]">
                      {t("result.specialist")}
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-[var(--ink-900)]">
                      {record.recommendedSpecialist}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Next steps */}
          {record.nextSteps.length > 0 ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {t("result.nextSteps")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {record.nextSteps.map((step) => (
                      <li key={step} className="flex items-start gap-3 text-sm text-[var(--ink-700)]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                          ✓
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Lifestyle */}
          {record.lifestyleTips.length > 0 ? (
            <Reveal>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HeartPulse className="h-4 w-4 text-[var(--cardiac-600)]" />
                    {t("result.lifestyle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {record.lifestyleTips.map((tip) => (
                      <li
                        key={tip}
                        className="rounded-2xl border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-3.5 text-xs leading-relaxed text-[var(--ink-700)]"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          ) : null}

          {/* Sources */}
          {record.sources.length > 0 ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-[var(--ink-100)] bg-white p-4 text-xs text-[var(--ink-500)] shadow-sm">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cardiac-400)]" />
              <span className="leading-relaxed">
                <strong className="text-[var(--ink-900)]">{t("result.sources")}:</strong>{" "}
                {record.sources.join(", ")}
              </span>
            </div>
          ) : null}
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-5">
          {record.status !== "non_heart" ? (
            <Reveal delay={1}>
              <HospitalSection
                initialHospitals={hospitalResult.hospitals}
                meta={hospitalResult.meta}
                city={record.city}
                pincode={record.pincode}
                risk={risk}
              />
            </Reveal>
          ) : null}
        </div>
      </div>

      {/* Limitations */}
      <details className="group rounded-3xl border border-[var(--ink-100)] bg-white p-5 shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[var(--ink-900)]">
          <span>{t("result.about")}</span>
          <ChevronRight className="h-4 w-4 text-[var(--cardiac-400)] transition-transform duration-200 group-open:rotate-90" />
        </summary>
        <p className="mt-4 border-t border-[var(--ink-50)] pt-4 text-xs leading-relaxed text-[var(--ink-500)]">
          {t("result.limitations")}
        </p>
      </details>

      <p className="px-4 text-center text-xs leading-relaxed text-[var(--ink-500)]">
        {DISCLAIMER}
      </p>
    </div>
  );
}
