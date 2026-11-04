import Link from "next/link";
import { Activity, Brain, HeartPulse, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";

const STEPS = [
  { icon: UserRound, title: "landing.step1Title", body: "landing.step1Body" },
  { icon: Stethoscope, title: "landing.step2Title", body: "landing.step2Body" },
  { icon: Activity, title: "landing.step3Title", body: "landing.step3Body" },
];

const FEATURES = [
  { icon: ShieldCheck, body: "landing.feature1" },
  { icon: Brain, body: "landing.feature2" },
  { icon: HeartPulse, body: "landing.feature3" },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-12 text-white">
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl">{t("landing.heroTitle")}</h1>
        <p className="mt-4 max-w-2xl text-base text-blue-50 sm:text-lg">{t("landing.heroSubtitle")}</p>
        <Button size="lg" variant="secondary" className="mt-6" asChild>
          <Link href="/check">{t("landing.cta")}</Link>
        </Button>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">{t("landing.howItWorks")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title}>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                    <step.icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{t(step.title)}</h3>
                <p className="text-sm text-slate-600">{t(step.body)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">{t("landing.featuresTitle")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.body}>
              <CardContent className="flex gap-3">
                <feature.icon aria-hidden className="h-6 w-6 shrink-0 text-blue-700" />
                <p className="text-sm text-slate-700">{t(feature.body)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <Card>
          <CardContent className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t("landing.limitsTitle")}</h2>
            <p className="text-sm text-slate-600">{t("landing.limitsBody")}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
