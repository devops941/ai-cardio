import Link from "next/link";
import { notFound } from "next/navigation";

import { EmergencyBanner } from "@/components/emergency-banner";
import { HospitalSection } from "@/components/result/hospital-section";
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {record.emergency ? <EmergencyBanner /> : null}

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("result.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {record.status !== "non_heart" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <RiskBadge risk={risk} />
                  {record.llmRisk ? (
                    <span className="text-sm text-slate-600">
                      {t("result.llmRisk")}: {record.llmRisk}
                    </span>
                  ) : null}
                  {record.mlProbability != null ? (
                    <span className="text-sm text-slate-600">
                      {t("result.mlProbability")}: {(record.mlProbability * 100).toFixed(0)}%
                    </span>
                  ) : null}
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

              <p className="text-xs text-slate-500">{t("aiNotice")}</p>
            </CardContent>
          </Card>

          {conditions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("result.conditions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {conditions.map((condition) => (
                  <div key={condition.name}>
                    <p className="font-medium text-slate-900">{condition.name}</p>
                    <p className="text-sm text-slate-600">{condition.why}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {record.explanation ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("result.explanation")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>{record.explanation}</p>
              </CardContent>
            </Card>
          ) : null}

          {record.recommendedSpecialist ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("result.specialist")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {record.recommendedSpecialist}
              </CardContent>
            </Card>
          ) : null}

          {record.nextSteps.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("result.nextSteps")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {record.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {record.lifestyleTips.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("result.lifestyle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {record.lifestyleTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {record.sources.length > 0 ? (
            <p className="text-xs text-slate-500">
              {t("result.sources")}: {record.sources.join(", ")}
            </p>
          ) : null}
        </div>

        <div className="space-y-6">
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

      <details className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-medium text-slate-900">{t("result.about")}</summary>
        <p className="mt-2 text-sm text-slate-600">{t("result.limitations")}</p>
      </details>

      <p className="mt-4 text-xs text-slate-500">{DISCLAIMER}</p>
    </div>
  );
}
