import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, AlertTriangle, BookOpen, CheckCircle2, ChevronRight, FileText, Heart, ShieldAlert, Sparkles, Stethoscope } from "lucide-react";

import { EmergencyBanner } from "@/components/emergency-banner";
import { HospitalSection } from "@/components/result/hospital-section";
import { ReportActions } from "@/components/result/report-actions";
import { RiskBadge } from "@/components/risk-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { DISCLAIMER, LLM_FALLBACK_MESSAGE, NON_HEART_MESSAGE, INSUFFICIENT_KNOWLEDGE_MESSAGE } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { findRankedHospitals } from "@/lib/hospitals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Condition {
  name: string;
  why: string;
}

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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Emergency Alert Banner if Emergency */}
      {record.emergency ? <EmergencyBanner /> : null}

      {/* Top Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <FileText className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Clinical Assessment Report
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Cardiovascular Risk Diagnostic
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Assessment ID: <span className="font-mono text-slate-700">{record.id.slice(-8)}</span> · Evaluated on{" "}
            {new Date(record.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <ReportActions />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Clinical Diagnostic Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Risk Level Core Card */}
          <Card className="overflow-hidden border-rose-100/90 shadow-xs">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Activity className="h-5 w-5 text-rose-600" />
                  Stratified Risk Assessment
                </CardTitle>
                <RiskBadge risk={risk} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {record.status !== "non_heart" ? (
                <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2">
                  {/* ML Confidence */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">ML Model Probability</span>
                      <span className="font-bold text-slate-900">{mlProb != null ? `${mlProb}%` : "Rule-Based"}</span>
                    </div>
                    {mlProb != null ? (
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            mlProb > 65
                              ? "bg-rose-600"
                              : mlProb > 35
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${mlProb}%` }}
                        />
                      </div>
                    ) : null}
                    <p className="text-[11px] text-slate-500">Trained on Cleveland Clinic cardiovascular cohort</p>
                  </div>

                  {/* Multi-modal synthesis */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-slate-600">Clinical Fusion Risk</span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Heart className="h-4 w-4 text-rose-600 heartbeat" />
                      <span>{record.llmRisk ?? risk ?? "Indeterminate"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Synthesized with RAG knowledge & Red-Flag rules</p>
                  </div>
                </div>
              ) : null}

              {record.status === "non_heart" ? (
                <Alert tone="info">
                  <p>{NON_HEART_MESSAGE}</p>
                  <Button className="mt-3 rounded-xl" size="sm" asChild>
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

              <div className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                <span>{t("aiNotice")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Differential Diagnoses / Possible Conditions */}
          {conditions.length > 0 ? (
            <Card className="border-rose-100/90 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Stethoscope className="h-4 w-4 text-rose-600" />
                  {t("result.conditions")}
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Differential diagnostic possibilities correlated with reported symptoms
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {conditions.map((condition, idx) => (
                  <div
                    key={condition.name}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs transition-all hover:border-rose-200"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-xs font-bold text-rose-600">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 text-sm">{condition.name}</p>
                      <p className="text-xs leading-relaxed text-slate-600">{condition.why}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* Clinical Pathophysiological Explanation */}
          {record.explanation ? (
            <Card className="border-rose-100/90 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <FileText className="h-4 w-4 text-rose-600" />
                  {t("result.explanation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-slate-700">
                <div className="rounded-2xl border border-rose-50 bg-rose-50/30 p-4">
                  {record.explanation}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Specialist Consultation Directive */}
          {record.recommendedSpecialist ? (
            <Card className="border-rose-200 bg-gradient-to-br from-white to-rose-50/40 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-rose-800">
                  <Stethoscope className="h-4 w-4 text-rose-600" />
                  {t("result.specialist")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm font-semibold text-slate-900">
                {record.recommendedSpecialist}
              </CardContent>
            </Card>
          ) : null}

          {/* Clinical Action Plan / Next Steps */}
          {record.nextSteps.length > 0 ? (
            <Card className="border-rose-100/90 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {t("result.nextSteps")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {record.nextSteps.map((step, idx) => (
                    <li key={step} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        ✓
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {/* Evidence-Based Lifestyle & Prevention */}
          {record.lifestyleTips.length > 0 ? (
            <Card className="border-rose-100/90 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Heart className="h-4 w-4 text-rose-600" />
                  {t("result.lifestyle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {record.lifestyleTips.map((tip) => (
                    <li
                      key={tip}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-700"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {/* Clinical Citations */}
          {record.sources.length > 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-2xs">
              <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-800">{t("result.sources")}:</strong> {record.sources.join(", ")}
              </span>
            </div>
          ) : null}
        </div>

        {/* Right Recommended Hospitals Column */}
        <div className="space-y-6 lg:col-span-5">
          {record.status !== "non_heart" ? (
            <HospitalSection
              initialHospitals={hospitalResult.hospitals}
              meta={hospitalResult.meta}
              city={record.city}
              pincode={record.pincode}
              risk={risk}
            />
          ) : null}
        </div>
      </div>

      {/* Limitations Collapsible */}
      <details className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 text-sm">
          <span>{t("result.about")}</span>
          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-90" />
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
          {t("result.limitations")}
        </p>
      </details>

      {/* Mandatory Statutory Medical Disclaimer */}
      <p className="text-center text-xs leading-relaxed text-slate-500 px-4">
        {DISCLAIMER}
      </p>
    </div>
  );
}
