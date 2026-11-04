"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Heart, Lock, Mail, ShieldCheck, Stethoscope } from "lucide-react";
import { Suspense, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setSubmitting(false);

    if (!result || result.error) {
      setError(t("auth.genericError"));
      return;
    }

    if (callbackUrl) {
      router.push(callbackUrl);
      return;
    }
    const session = await fetch("/api/auth/session").then((r) => r.json());
    router.push(session?.user?.role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-xl shadow-rose-950/5">
      <div className="grid md:grid-cols-12">
        {/* Left Side: Medical Visual Banner */}
        <div className="relative hidden md:col-span-5 md:block bg-gradient-to-br from-rose-900 via-rose-950 to-slate-900 p-8 text-white">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rose-200 backdrop-blur-xs">
                <Heart className="h-3.5 w-3.5 text-rose-400 heartbeat" />
                Clinical Portal
              </div>
              <h2 className="text-2xl font-bold tracking-tight">CardioCare AI</h2>
              <p className="text-xs leading-relaxed text-rose-100/80">
                Evidence-grounded cardiovascular triage, predictive ML modeling, and emergency clinical routing.
              </p>
            </div>

            <div className="relative my-6 h-48 w-full overflow-hidden rounded-2xl border border-white/10 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                alt="Cardiologist examining clinical telemetry"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Cleveland-Validated
                </span>
                <span className="text-rose-200">96.4% Recall</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4 text-[11px] text-rose-200/90">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-rose-400" />
                <span>Deterministic red-flag rule evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-rose-400" />
                <span>Encrypted health record storage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign-in Form */}
        <div className="p-8 md:col-span-7 sm:p-10">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("auth.loginTitle")}</h1>
            <p className="text-xs text-slate-500">
              Enter your credentials to access your cardiovascular assessment dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {error ? <Alert tone="error">{error}</Alert> : null}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-700">{t("auth.email")}</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="patient@cardiacare.org"
                  autoComplete="email"
                  required
                  aria-describedby={error ? "login-error" : undefined}
                  className="pl-9"
                />
                <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-slate-700">{t("auth.password")}</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pl-9"
                />
                <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2 rounded-xl shadow-md shadow-rose-600/20" disabled={submitting}>
              {submitting ? "Signing in..." : t("auth.submitLogin")}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
            {t("auth.noAccount")}{" "}
            <Link className="font-semibold text-rose-600 hover:text-rose-700 hover:underline" href="/register">
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12 md:py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
