import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Clock,
  Heart,
  HeartPulse,
  PhoneCall,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { Counter } from "@/components/motion/counter";
import { EcgLine, EcgStrip } from "@/components/motion/ecg-line";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";

const STEPS = [
  { icon: UserRound, title: "landing.step1Title", body: "landing.step1Body", badge: "01" },
  { icon: Stethoscope, title: "landing.step2Title", body: "landing.step2Body", badge: "02" },
  { icon: Activity, title: "landing.step3Title", body: "landing.step3Body", badge: "03" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Dual Guardrail Safety",
    body: "landing.feature1",
    tag: "Patient Safety",
    image:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Brain,
    title: "Cleveland Machine Learning",
    body: "landing.feature2",
    tag: "Random Forest model",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: HeartPulse,
    title: "Verified Knowledge Base",
    body: "landing.feature3",
    tag: "Curated Sources",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
  },
];

const STATS = [
  { value: 303, suffix: "", decimals: 0, label: "Cleveland dataset rows", sub: "UCI training cohort" },
  { value: 8, suffix: "", decimals: 0, label: "Red-flag rules", sub: "Deterministic triage" },
  { value: 13, suffix: "", decimals: 0, label: "Clinical markers", sub: "Cleveland cohort" },
  { value: 100, suffix: "%", decimals: 0, label: "Grounded citations", sub: "Every explanation" },
];

const TRUST = [
  "Zero commercial advertising",
  "108 / 112 emergency triage sync",
  "Conservative risk fusion",
  "Non-diagnostic by design",
  "Privacy-first architecture",
  "Evidence-grounded retrieval",
];

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* ================= HERO ================= */}
      <section className="relative isolate w-full overflow-hidden cardiac-mesh">
        {/* Background photographic layer */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=2000&q=80"
            alt="Cardiology clinical environment"
            fill
            priority
            className="object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--cardiac-950)]/95 via-[var(--cardiac-900)]/85 to-[var(--cardiac-950)]/95" />
        </div>

        <div className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-10 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            {/* Copy */}
            <div className="lg:col-span-7">
              <Reveal>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--cardiac-300)]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cardiac-100)] backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cardiac-400)] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--cardiac-400)]" />
                  </span>
                  Cardiovascular Clinical Screening Platform
                </span>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-balance text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Listen to your heart
                  <span className="mt-2 block bg-gradient-to-r from-[var(--cardiac-300)] via-white to-[var(--cardiac-200)] bg-clip-text text-transparent">
                    before it has to shout.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--cardiac-100)]/90 sm:text-lg">
                  Describe your heart symptoms, add recent test values, and receive instant
                  plain-language risk stratification, emergency red-flag analysis, and nearby
                  cardiac hospitals — in under a minute.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Button size="lg" asChild className="group">
                    <Link href="/check" className="flex items-center gap-2.5">
                      <Heart className="h-5 w-5 animate-heartbeat fill-white/30 text-white" />
                      {t("landing.cta")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  <Button size="lg" variant="glass" asChild>
                    <Link href="/hospitals" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Locate Cardiac Hospitals
                    </Link>
                  </Button>

                  <a
                    href="#how-it-works"
                    className="group flex items-center gap-2.5 text-sm font-semibold text-[var(--cardiac-100)] transition-colors hover:text-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-all group-hover:scale-110 group-hover:bg-white/20">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </span>
                    See how it works
                  </a>
                </div>
              </Reveal>

              {/* Trust badges */}
              <Reveal delay={4}>
                <div className="mt-10 grid gap-3 border-t border-white/15 pt-8 sm:grid-cols-3">
                  {[
                    { icon: CheckCircle2, text: "Zero commercial ads" },
                    { icon: Clock, text: "Under 30 seconds" },
                    { icon: ShieldCheck, text: "Emergency-safe guardrails" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5 text-sm text-[var(--cardiac-100)]">
                      <item.icon className="h-4 w-4 shrink-0 text-[var(--cardiac-300)]" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Hero visual card */}
            <div className="lg:col-span-5">
              <Reveal delay={2}>
                <div className="relative mx-auto max-w-md">
                  {/* Floating stat chips */}
                  <div className="absolute -left-4 top-8 z-20 hidden animate-soft-float rounded-md border border-[var(--cardiac-100)] bg-white p-3 shadow-sm sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-500)]">
                      Screening model
                    </p>
                    <p className="text-xl font-black text-[var(--cardiac-700)]">Random Forest</p>
                  </div>

                  <div
                    className="absolute -right-4 bottom-24 z-20 hidden animate-soft-float rounded-md border border-[var(--cardiac-100)] bg-white p-3 shadow-sm sm:block"
                    style={{ animationDelay: "1.2s" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-500)]">
                      Triage Time
                    </p>
                    <p className="text-xl font-black text-[var(--cardiac-700)]">&lt;30s</p>
                  </div>

                  <div className="cardiac-ring relative overflow-hidden rounded-lg border border-white/15 bg-[var(--cardiac-950)]/50 backdrop-blur-md">
                    <div className="relative h-72 w-full overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"
                        alt="Cardiologist reviewing a cardiac test report"
                        fill
                        priority
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--cardiac-950)] via-[var(--cardiac-950)]/25 to-transparent" />

                      {/* ECG overlay */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 opacity-70">
                        <EcgLine color="#ff9dad" strokeWidth={2} />
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--cardiac-600)]/25 text-[var(--cardiac-200)]">
                            <HeartPulse className="h-5 w-5 animate-pulse" />
                          </span>
                          <div>
                            <p className="text-xs font-bold leading-none text-white">
                              Emergency Triage
                            </p>
                            <p className="mt-1 text-[10px] text-[var(--cardiac-200)]/80">
                              Automated RF-01 → RF-08 rules
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                          Active
                        </span>
                      </div>

                      <div className="space-y-2 rounded-md bg-white/5 p-3.5">
                        {[
                          { label: "Symptom analysis", value: "Complete", tone: "text-emerald-300" },
                          { label: "Risk stratification", value: "Moderate", tone: "text-amber-300" },
                          { label: "Hospitals ranked", value: "5 found", tone: "text-[var(--cardiac-200)]" },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between text-[11px]">
                            <span className="text-[var(--cardiac-200)]/75">{row.label}</span>
                            <span className={`font-bold ${row.tone}`}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Bottom ECG divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <EcgLine color="#fb6482" strokeWidth={2} className="h-14 opacity-60" />
        </div>
      </section>

      {/* ================= TRUST MARQUEE ================= */}
      <section className="w-full border-y border-[var(--cardiac-100)] bg-white py-5">
        <div className="relative flex overflow-hidden">
          <div className="flex min-w-full shrink-0 animate-marquee items-center justify-around gap-12">
            {[...TRUST, ...TRUST].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]"
              >
                <Heart className="h-3.5 w-3.5 text-[var(--cardiac-400)]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <Reveal key={stat.label} delay={(index + 1) as 1 | 2 | 3 | 4}>
              <div className="cardiac-card group h-full p-6 text-center">
                <p className="text-4xl font-black tracking-tight text-[var(--cardiac-600)] sm:text-5xl">
                  <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </p>
                <p className="mt-3 text-sm font-bold text-[var(--ink-900)]">{stat.label}</p>
                <p className="mt-0.5 text-xs text-[var(--ink-500)]">{stat.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="w-full bg-gradient-to-b from-[var(--cardiac-50)]/70 to-white py-20">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cardiac-200)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cardiac-700)]">
              <Sparkles className="h-3.5 w-3.5" />
              Guided Screening Journey
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-[var(--ink-900)] sm:text-5xl">
              {t("landing.howItWorks")}
            </h2>
            <p className="mt-3 text-base text-[var(--ink-500)]">
              A three-step clinical assessment that takes under two minutes.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={(index + 1) as 1 | 2 | 3}>
                <div className="group relative h-full overflow-hidden rounded-md border border-[var(--cardiac-100)] bg-white p-7 shadow-sm transition-all duration-300 hover:border-[var(--cardiac-300)]">
                  <div className="absolute right-5 top-4 text-5xl font-black text-[var(--cardiac-100)] transition-colors group-hover:text-[var(--cardiac-200)]">
                    {step.badge}
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-[var(--cardiac-50)] to-[var(--cardiac-100)] text-[var(--cardiac-700)] transition-transform duration-300 group-hover:scale-110">
                    <step.icon aria-hidden className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-[var(--ink-900)]">{t(step.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-500)]">{t(step.body)}</p>
                  <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-[var(--cardiac-50)]">
                    <div className="h-full w-0 rounded-full bg-gradient-to-r from-[var(--cardiac-500)] to-[var(--cardiac-700)] transition-all duration-500 group-hover:w-full" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES WITH PHOTOGRAPHY ================= */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-10">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--cardiac-600)]">
              Technology &amp; Safety
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--ink-900)] sm:text-5xl">
              {t("landing.featuresTitle")}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--ink-500)]">
            Built with strict safety guardrails that refuse non-cardiac distractions and
            immediately prioritize emergencies.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-7 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index + 1) as 1 | 2 | 3}>
              <article className="group flex h-full flex-col overflow-hidden rounded-md border border-[var(--cardiac-100)] bg-white shadow-sm transition-all duration-300 hover:border-[var(--cardiac-300)]">
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--cardiac-950)]/70 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--cardiac-700)] backdrop-blur-sm">
                    {feature.tag}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--cardiac-50)] text-[var(--cardiac-700)]">
                    <feature.icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-[var(--ink-900)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-500)]">
                    {t(feature.body)}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <EcgStrip className="opacity-30" />

      {/* ================= HOSPITAL / IMAGERY SHOWCASE ================= */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-lg border border-[var(--cardiac-100)] shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"
                alt="Modern cardiac care hospital facility"
                width={1200}
                height={800}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[26rem] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--cardiac-950)]/80 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Clinical readiness ranking</p>
                      <p className="text-[11px] text-[var(--cardiac-200)]">
                        Cath lab · 24×7 emergency · distance
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cardiac-700)]">
                <Building2 className="h-3.5 w-3.5" />
                Emergency Access
              </span>
              <h2 className="text-3xl font-black tracking-tight text-[var(--ink-900)] sm:text-4xl">
                Ranked cardiac hospitals, moments away
              </h2>
              <p className="text-base leading-relaxed text-[var(--ink-500)]">
                We rank verified cardiac facilities by clinical readiness and proximity, so an
                emergency never has to wait for a search.
              </p>

              <ul className="space-y-3.5">
                {[
                  "GPS or pincode-based facility discovery within 25 km",
                  "Cath-lab and 24×7 emergency capability filtering",
                  "Direct one-tap calling and turn-by-turn directions",
                  "Verified cardiologist rosters with specializations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--ink-700)]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/hospitals" className="flex items-center gap-2">
                    Explore hospital directory
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="tel:108" className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-red-600" />
                    Emergency 108
                  </a>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= SAFETY / LIMITS ================= */}
      <section className="mx-auto w-full max-w-[1600px] px-4 pb-20 sm:px-6 lg:px-10">
        <Reveal>
          <Card className="overflow-hidden border-[var(--cardiac-200)]">
            <div className="h-1.5 w-full bg-gradient-to-r from-[var(--cardiac-500)] via-[var(--cardiac-600)] to-[var(--cardiac-800)]" />
            <CardContent className="grid gap-8 p-8 lg:grid-cols-12 lg:p-10">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--cardiac-50)] text-[var(--cardiac-700)]">
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold text-[var(--ink-900)] sm:text-2xl">
                    {t("landing.limitsTitle")}
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--ink-500)]">
                  {t("landing.limitsBody")}
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="grid gap-3">
                  {[
                    { icon: ShieldCheck, text: "Does not diagnose or replace a physician" },
                    { icon: Activity, text: "Does not analyze ECG waveforms or imaging" },
                    { icon: Clock, text: "Not a booking or prescription service" },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-3 rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/50 p-3.5 text-xs font-medium text-[var(--ink-700)]"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-[var(--cardiac-500)]" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="mx-auto w-full max-w-[1600px] px-4 pb-24 sm:px-6 lg:px-10">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-lg cardiac-mesh px-6 py-16 text-center sm:px-16">
            <div className="absolute inset-0 -z-10 opacity-25">
              <Image
                src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80"
                alt=""
                fill
                sizes="100vw"
                className="object-cover mix-blend-luminosity"
              />
            </div>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-white/10">
              <Heart className="h-8 w-8 animate-heartbeat fill-white/30 text-white" />
            </div>

            <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-black tracking-tight text-white sm:text-5xl">
              Your heart deserves a two-minute check-in.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--cardiac-100)]/90">
              Start a free, private, evidence-based cardiovascular screening now. No account
              required to begin.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="bg-white text-[var(--cardiac-800)] hover:bg-[var(--cardiac-50)]">
                <Link href="/check" className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-[var(--cardiac-600)]" />
                  Start free screening
                </Link>
              </Button>
              <Button size="lg" variant="glass" asChild>
                <Link href="/register">Create an account</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[var(--cardiac-200)]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Data never sold
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Cancel anytime
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
