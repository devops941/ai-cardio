import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  Heart,
  HeartPulse,
  Hospital,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

import { Counter } from "@/components/motion/counter";
import { EcgLine } from "@/components/motion/ecg-line";
import { Reveal } from "@/components/motion/reveal";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  {
    href: "/check",
    icon: Heart,
    title: "Start Cardiac Screening",
    body: "Step-by-step triage guided by symptoms and clinical markers.",
    accent: true,
  },
  {
    href: "/hospitals",
    icon: MapPin,
    title: "Hospital Directory",
    body: "Verified cardiac facilities with cath labs and 24×7 emergency.",
    accent: false,
  },
  {
    href: "/history",
    icon: Calendar,
    title: "Assessment History",
    body: "Review your recorded screenings and diagnostic details.",
    accent: false,
  },
];

const ESSENTIALS = [
  {
    title: "Blood pressure awareness",
    body: "Optimal resting BP sits under 120/80 mmHg. Monitor periodically for silent elevation.",
  },
  {
    title: "150 minutes of activity weekly",
    body: "Brisk walking, cycling, or swimming strengthens myocardial efficiency and lipid balance.",
  },
  {
    title: "Recognize acute red flags",
    body: "Substernal crushing pain, jaw or arm radiation, and diaphoresis require urgent 108 contact.",
  },
];

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
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Hero */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-lg cardiac-mesh p-6 sm:p-10">
          <div className="absolute inset-0 -z-10 opacity-20">
            <Image
              src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=1600&q=80"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover mix-blend-luminosity"
            />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 lg:col-span-7">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--cardiac-300)]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cardiac-100)] backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cardiac-400)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cardiac-400)]" />
                </span>
                Patient Cardiovascular Portal
              </span>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-[var(--cardiac-200)] to-white bg-clip-text text-transparent">
                  {user.name}
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-[var(--cardiac-100)]/85">
                Access your clinical cardiac risk assessments, explore nearby 24×7 cardiology
                centers, and monitor early cardiovascular warning indicators in real time.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button size="lg" asChild className="group">
                  <Link href="/check" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {t("check.title")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="glass" asChild>
                  <Link href="/hospitals" className="flex items-center gap-2">
                    <Hospital className="h-4 w-4" />
                    {t("hospitals.title")}
                  </Link>
                </Button>
              </div>

              <div className="grid max-w-lg grid-cols-2 gap-4 border-t border-white/15 pt-5">
                {[
                  { label: "Screenings", value: count },
                  { label: "Red-flag rules", value: 8 },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-2xl font-black text-white">
                      <Counter value={item.value} />
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cardiac-200)]/80">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-md border border-white/15 bg-[var(--cardiac-950)]/40 backdrop-blur-md">
                <div className="relative h-52 w-full overflow-hidden sm:h-60">
                  <Image
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"
                    alt="Cardiology clinical consultation"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--cardiac-950)] via-transparent to-transparent" />
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 opacity-60">
                    <EcgLine color="#ff9dad" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <span className="flex items-center gap-2 text-xs font-medium text-[var(--cardiac-100)]">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Cleveland ML + AHA engine
                  </span>
                  <span className="rounded-full bg-[var(--cardiac-600)]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Quick actions */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action, index) => (
          <Reveal key={action.href} delay={(index + 1) as 1 | 2 | 3}>
            <Link
              href={action.href}
              className="group flex h-full flex-col rounded-md border border-[var(--cardiac-100)] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[var(--cardiac-300)]"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-md transition-colors ${
                  action.accent
                    ? "bg-gradient-to-br from-[var(--cardiac-500)] to-[var(--cardiac-800)] text-white"
                    : "bg-[var(--cardiac-50)] text-[var(--cardiac-700)] group-hover:bg-[var(--cardiac-600)] group-hover:text-white"
                }`}
              >
                <action.icon className={`h-6 w-6 ${action.accent ? "animate-heartbeat" : ""}`} />
              </div>
              <h3 className="mt-4 font-bold text-[var(--ink-900)] transition-colors group-hover:text-[var(--cardiac-700)]">
                {action.title}
              </h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-[var(--ink-500)]">
                {action.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--cardiac-600)]">
                Continue
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}

        {/* Emergency card */}
        <Reveal delay={4}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-md bg-gradient-to-br from-red-600 via-[var(--cardiac-600)] to-[var(--cardiac-800)] p-6 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-md bg-white/20">
              <Phone className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="relative mt-4 font-bold text-white">24×7 Ambulance Hotline</h3>
            <p className="relative mt-1.5 flex-1 text-xs leading-relaxed text-red-50">
              Immediate dispatch for acute chest pain or emergency symptoms.
            </p>
            <div className="relative mt-4 flex gap-2">
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--cardiac-700)] transition-transform hover:scale-105"
              >
                Dial 108
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/25"
              >
                Dial 112
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Latest assessment */}
        <div className="lg:col-span-7">
          <Reveal>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5 text-[var(--cardiac-600)]" />
                    Latest Assessment Summary
                  </CardTitle>
                  <p className="mt-1 text-xs text-[var(--ink-500)]">
                    Most recent cardiovascular evaluation
                  </p>
                </div>
                {last ? (
                  <Link
                    href="/history"
                    className="text-xs font-bold text-[var(--cardiac-600)] transition-colors hover:text-[var(--cardiac-800)] hover:underline"
                  >
                    View all ({count})
                  </Link>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                {last ? (
                  <div className="space-y-4 rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <RiskBadge
                          risk={(last.finalRisk as "LOW" | "MODERATE" | "HIGH" | null) ?? null}
                        />
                        {last.emergency ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cardiac-100)] px-2.5 py-0.5 text-xs font-bold text-[var(--cardiac-800)]">
                            Emergency flag
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-[var(--ink-500)]">
                        {new Date(last.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="line-clamp-3 text-xs leading-relaxed text-[var(--ink-700)]">
                      {last.explanation ??
                        "Cardiovascular screening recorded with risk stratification."}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cardiac-100)] pt-3">
                      <span className="text-xs text-[var(--ink-500)]">
                        Status:{" "}
                        <span className="font-semibold text-[var(--ink-900)]">
                          {t(`status.${last.status}`)}
                        </span>
                      </span>
                      <Button asChild size="sm">
                        <Link href={`/result/${last.id}`} className="flex items-center gap-1.5">
                          Open full report
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cardiac-100)] text-[var(--cardiac-600)]">
                      <Heart className="h-7 w-7 animate-heartbeat" />
                    </div>
                    <h4 className="mt-4 font-bold text-[var(--ink-900)]">
                      No assessment records yet
                    </h4>
                    <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--ink-500)]">
                      Complete your first cardiac triage to establish your baseline cardiovascular
                      risk and receive evidence-based guidance.
                    </p>
                    <Button asChild size="sm" className="mt-5">
                      <Link href="/check">Start your first check</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Essentials */}
        <div className="lg:col-span-5">
          <Reveal delay={2}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HeartPulse className="h-5 w-5 text-[var(--cardiac-600)]" />
                  Heart Health Essentials
                </CardTitle>
                <p className="mt-1 text-xs text-[var(--ink-500)]">
                  AHA &amp; ACC preventive cardiology standards
                </p>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {ESSENTIALS.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 rounded-md border border-[var(--cardiac-100)] bg-white p-4 transition-all hover:border-[var(--cardiac-200)] hover:shadow-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--cardiac-50)] text-sm font-black text-[var(--cardiac-600)]">
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="text-sm font-bold text-[var(--ink-900)]">{item.title}</h5>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--ink-500)]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2.5 rounded-md bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
                  <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" />
                  Consistent screening improves early detection rates.
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--ink-300)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Guidance is educational and not a substitute for clinical advice.
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
