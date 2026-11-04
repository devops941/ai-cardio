import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowRight, Calendar, Heart, Hospital, MapPin, Phone, ShieldCheck, Stethoscope } from "lucide-react";

import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [last, count] = await Promise.all([
    prisma.prediction.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.prediction.count({
      where: { userId: user.id },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Patient Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50/40 to-rose-100/30 p-6 shadow-sm md:p-8">
        <div className="relative z-10 grid gap-6 md:grid-cols-12 md:items-center">
          <div className="space-y-4 md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/90 px-3.5 py-1 text-xs font-semibold text-rose-700 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              Patient Cardiovascular Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Welcome back, <span className="text-rose-600">{user.name}</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Access your clinical cardiac risk assessments, explore nearby 24×7 cardiology centers, and monitor early cardiovascular warning indicators in real time.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-xl shadow-md shadow-rose-600/20">
                <Link href="/check" className="inline-flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t("check.title")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="rounded-xl border-slate-200">
                <Link href="/hospitals" className="inline-flex items-center gap-2">
                  <Hospital className="h-4 w-4 text-rose-600" />
                  {t("hospitals.title")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-rose-200/60 shadow-inner md:col-span-5 md:h-56">
            <Image
              src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80"
              alt="Cardiology clinical consultation"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Cleveland ML + AHA Clinical Engine</span>
              </div>
              <span className="rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/check"
          className="group relative overflow-hidden rounded-2xl border border-rose-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white">
            <Heart className="h-6 w-6 heartbeat" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-rose-600">Start Cardiac Screening</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Step-by-step triage guided by symptoms and clinical markers.
          </p>
          <span className="mt-3 inline-flex items-center text-xs font-semibold text-rose-600">
            Begin check &rarr;
          </span>
        </Link>

        <Link
          href="/hospitals"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-rose-600 group-hover:text-white">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-rose-600">Hospital Directory</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Verified cardiac facilities with Cath Lab & 24×7 emergency.
          </p>
          <span className="mt-3 inline-flex items-center text-xs font-semibold text-slate-700 group-hover:text-rose-600">
            Find nearby &rarr;
          </span>
        </Link>

        <Link
          href="/history"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-rose-600 group-hover:text-white">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-rose-600">Assessment History</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {count} recorded {count === 1 ? "screening" : "screenings"} on file with diagnostic details.
          </p>
          <span className="mt-3 inline-flex items-center text-xs font-semibold text-slate-700 group-hover:text-rose-600">
            View history &rarr;
          </span>
        </Link>

        <div className="relative overflow-hidden rounded-2xl border border-rose-300/80 bg-gradient-to-br from-rose-600 to-rose-700 p-5 text-white shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
            <Phone className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="mt-4 font-semibold text-white">24×7 Ambulance Hotline</h3>
          <p className="mt-1 text-xs leading-relaxed text-rose-100">
            Immediate dispatch for acute chest pain or emergency symptoms.
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-50"
            >
              Dial 108
            </a>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-800/80 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-rose-900"
            >
              Dial 112
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Assessment + Heart Guidelines */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Latest Assessment Showcase */}
        <div className="lg:col-span-7">
          <Card className="h-full border-rose-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-rose-600" />
                  Latest Assessment Summary
                </CardTitle>
                <p className="text-xs text-slate-500">Most recent cardiovascular evaluation</p>
              </div>
              {last ? (
                <Link
                  href="/history"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  View All ({count})
                </Link>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {last ? (
                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <RiskBadge risk={(last.finalRisk as "LOW" | "MODERATE" | "HIGH" | null) ?? null} />
                      {last.emergency ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                          Emergency Flag
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(last.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {last.explanation ? (
                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {last.explanation}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Cardiovascular screening recorded with risk stratification.
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                    <div className="text-xs text-slate-500">
                      Status: <span className="font-medium text-slate-800">{last.status}</span>
                    </div>
                    <Button asChild size="sm" className="rounded-xl">
                      <Link href={`/result/${last.id}`} className="inline-flex items-center gap-1.5">
                        Open Full Report &rarr;
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/30 p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 font-semibold text-slate-900">No Assessment Records Yet</h4>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                    Complete your first cardiac triage to establish your baseline cardiovascular risk and receive evidence-based health guidance.
                  </p>
                  <Button asChild size="sm" className="mt-4 rounded-xl">
                    <Link href="/check">Start Your First Check</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clinical Heart Health Guidance */}
        <div className="lg:col-span-5">
          <Card className="h-full border-rose-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Heart Health Essentials</CardTitle>
              <p className="text-xs text-slate-500">AHA & ACC Preventive Cardiology Standards</p>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold">
                  1
                </span>
                <div>
                  <h5 className="font-semibold text-slate-900">Blood Pressure Awareness</h5>
                  <p className="mt-0.5 text-slate-600">Optimal resting BP is under 120/80 mmHg. Monitor periodically for asymptomatic elevation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold">
                  2
                </span>
                <div>
                  <h5 className="font-semibold text-slate-900">150 Minutes Weekly Aerobic Activity</h5>
                  <p className="mt-0.5 text-slate-600">Brisk walking, cycling, or swimming strengthens myocardial efficiency and improves lipid balance.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white p-3 shadow-xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold">
                  3
                </span>
                <div>
                  <h5 className="font-semibold text-slate-900">Recognize Acute Red Flags</h5>
                  <p className="mt-0.5 text-slate-600">Substernal crushing chest pain, jaw/arm radiation, and diaphoresis require urgent 108 contact.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
