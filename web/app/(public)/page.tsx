import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  Building2,
  CheckCircle,
  Clock,
  Heart,
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";

const STEPS = [
  {
    icon: UserRound,
    title: "landing.step1Title",
    body: "landing.step1Body",
    badge: "Step 1",
  },
  {
    icon: Stethoscope,
    title: "landing.step2Title",
    body: "landing.step2Body",
    badge: "Step 2",
  },
  {
    icon: Activity,
    title: "landing.step3Title",
    body: "landing.step3Body",
    badge: "Step 3",
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Dual Guardrail Safety",
    body: "landing.feature1",
    tag: "Patient Safety",
  },
  {
    icon: Brain,
    title: "Cleveland Machine Learning",
    body: "landing.feature2",
    tag: "96.4% Recall",
  },
  {
    icon: HeartPulse,
    title: "Verified Knowledge Base",
    body: "landing.feature3",
    tag: "Curated Sources",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-900 via-rose-800 to-red-950 px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-16">
        {/* Soft Background Accents */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-3.5 py-1.5 text-xs font-bold text-rose-100 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              <span>Cardiovascular Clinical Screening Platform</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl sm:leading-tight">
              Cardio<span className="text-rose-400">Care</span>: Fast, Evidence-Based Heart Health Screening
            </h1>

            <p className="max-w-2xl text-base text-rose-100 sm:text-lg leading-relaxed">
              Describe your heart symptoms, enter recent test values, and instantly receive plain-language risk stratification, emergency red-flag analysis, and nearby cardiac hospitals.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                className="bg-white text-rose-800 hover:bg-rose-50 font-bold shadow-xl shadow-rose-950/20 text-base group"
                asChild
              >
                <Link href="/check" className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-600 animate-heartbeat fill-rose-600/30" />
                  <span>{t("landing.cta")}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-rose-300/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md font-semibold"
                asChild
              >
                <Link href="/hospitals" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-rose-300" />
                  <span>Locate Cardiac Hospitals</span>
                </Link>
              </Button>
            </div>

            {/* Live Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-rose-700/60 text-xs">
              <div className="flex items-center gap-2 text-rose-200">
                <CheckCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Zero Commercial Ads</span>
              </div>
              <div className="flex items-center gap-2 text-rose-200">
                <CheckCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>108 / 112 Triage Sync</span>
              </div>
              <div className="flex items-center gap-2 text-rose-200">
                <CheckCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Conservative Risk Fusion</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border-2 border-rose-300/30 bg-rose-950/40 shadow-2xl backdrop-blur-md">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                alt="Cardiologist consulting medical test report"
                className="h-64 w-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 p-3.5 text-slate-900 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-black">
                      <HeartPulse className="h-4 w-4 animate-pulse" />
                    </span>
                    <div>
                      <p className="text-xs font-bold leading-none">Emergency Triaged</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Automated RF-01 to RF-08 Check</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    Active Guardrail
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Banner */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs text-center">
          <p className="text-3xl font-black text-rose-600">96.4%</p>
          <p className="text-xs font-semibold text-slate-600 mt-1">Screening Recall (Random Forest)</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs text-center">
          <p className="text-3xl font-black text-slate-900">8 Rules</p>
          <p className="text-xs font-semibold text-slate-600 mt-1">Deterministic Red Flags</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs text-center">
          <p className="text-3xl font-black text-rose-600">&lt; 30s</p>
          <p className="text-xs font-semibold text-slate-600 mt-1">Assessment Turnaround</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-xs text-center">
          <p className="text-3xl font-black text-slate-900">100%</p>
          <p className="text-xs font-semibold text-slate-600 mt-1">Grounded Citations</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 border border-rose-200">
            Guided Screening Journey
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {t("landing.howItWorks")}
          </h2>
          <p className="text-sm text-slate-600">
            A three-step clinical assessment that takes under two minutes.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card
              key={step.title}
              className="relative overflow-hidden group hover:border-rose-300 transition-all duration-300"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-red-600" />
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-110 transition-transform">
                    <step.icon aria-hidden className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-black text-slate-600">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t(step.title)}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t(step.body)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Clinical Features with Photography */}
      <section className="rounded-3xl border border-rose-100 bg-rose-50/50 p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Technology & Safety
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {t("landing.featuresTitle")}
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-sm">
            Built with strict safety guardrails that refuse non-cardiac distractions and immediately prioritize emergencies.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.body}
              className="flex flex-col justify-between rounded-2xl border border-white bg-white p-6 shadow-sm transition-all hover:border-rose-200 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <feature.icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t(feature.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations & Safety Notice */}
      <section>
        <Card className="border-rose-200 bg-gradient-to-r from-white via-rose-50/30 to-white">
          <CardContent className="space-y-3 p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">{t("landing.limitsTitle")}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {t("landing.limitsBody")}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
