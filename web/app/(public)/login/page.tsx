"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Heart, Lock, Mail } from "lucide-react";
import { Suspense, useState } from "react";

import { AuthShowcase } from "@/components/auth/auth-showcase";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
    <div className="grid w-full overflow-hidden rounded-[2rem] border border-[var(--cardiac-100)] bg-white shadow-[0_30px_80px_-40px_rgba(222,17,69,0.5)] lg:grid-cols-12">
      <AuthShowcase
        eyebrow="Clinical Portal"
        title="Welcome back to CardioCare."
        body="Sign in to continue your cardiovascular screening journey, review past assessments, and access ranked emergency cardiac centers."
        image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
        imageAlt="Cardiologist examining clinical telemetry"
      />

      <section className="lg:col-span-6">
        <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center p-8 sm:p-12">
          <div className="mb-8 space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--cardiac-50)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cardiac-700)]">
              <Heart className="h-3 w-3 animate-heartbeat" />
              Secure sign in
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[var(--ink-900)]">
              {t("auth.loginTitle")}
            </h1>
            <p className="text-sm text-[var(--ink-500)]">
              Enter your credentials to access your cardiovascular assessment dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {error ? <Alert tone="error">{error}</Alert> : null}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-[var(--ink-700)]">
                {t("auth.email")}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="patient@cardiacare.org"
                  autoComplete="email"
                  required
                  aria-describedby={error ? "login-error" : undefined}
                  className="pl-10"
                />
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-[var(--ink-700)]">
                  {t("auth.password")}
                </Label>
                <span className="text-[11px] text-[var(--ink-300)]">Minimum 8 characters</span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pl-10"
                />
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
              </div>
            </div>

            <Button type="submit" className="group w-full" disabled={submitting}>
              {submitting ? "Signing in..." : t("auth.submitLogin")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <div className="mt-8 border-t border-[var(--cardiac-100)] pt-6 text-center text-xs text-[var(--ink-500)]">
            {t("auth.noAccount")}{" "}
            <Link
              className="font-bold text-[var(--cardiac-600)] transition-colors hover:text-[var(--cardiac-800)] hover:underline"
              href="/register"
            >
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
