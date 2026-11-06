"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

import { AuthShowcase } from "@/components/auth/auth-showcase";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");
    if (password !== confirm) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password,
        consent: form.get("consent") === "on",
        adult: form.get("adult") === "on",
      }),
    });
    const body = await response.json().catch(() => null);
    setSubmitting(false);

    if (!response.ok) {
      if (body?.error?.code === "EMAIL_EXISTS") {
        setError(t("errors.emailExists"));
        return;
      }
      const details: Record<string, string> = {};
      for (const detail of body?.error?.details ?? []) {
        details[detail.field] = detail.issue;
      }
      setFieldErrors(details);
      setError(body?.error?.message ?? t("errors.generic"));
      return;
    }

    await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password,
      redirect: false,
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="grid w-full overflow-hidden rounded-lg border border-[var(--cardiac-100)] bg-white shadow-sm lg:grid-cols-12">
        <AuthShowcase
          eyebrow="Patient Registration"
          title="Join CardioCare."
          body="Create your profile to unlock intelligent cardiac risk scoring, save your screening history, and locate certified cath labs nearby."
          image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
          imageAlt="Medical professional reviewing cardiovascular care"
        />

        <section className="lg:col-span-6">
          <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center p-8 sm:p-12">
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-[var(--ink-900)]">
                {t("auth.registerTitle")}
              </h1>
              <p className="text-sm text-[var(--ink-500)]">
                Complete your details below to activate your cardiovascular assessment account.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {error ? <Alert tone="error">{error}</Alert> : null}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-[var(--ink-700)]">
                  {t("auth.name")}
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full name"
                    required
                    aria-describedby="name-error"
                    className="pl-10"
                  />
                  <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
                {fieldErrors.name ? (
                  <p id="name-error" className="text-xs text-[var(--cardiac-600)]">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

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
                    aria-describedby="email-error"
                    className="pl-10"
                  />
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                </div>
                {fieldErrors.email ? (
                  <p id="email-error" className="text-xs text-[var(--cardiac-600)]">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold text-[var(--ink-700)]">
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      aria-describedby="password-error"
                      className="pl-10"
                    />
                    <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                  </div>
                  {fieldErrors.password ? (
                    <p id="password-error" className="text-xs text-[var(--cardiac-600)]">
                      {fieldErrors.password}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold text-[var(--ink-700)]"
                  >
                    {t("auth.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      aria-describedby="confirm-error"
                      className="pl-10"
                    />
                    <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
                  </div>
                  {fieldErrors.confirmPassword ? (
                    <p id="confirm-error" className="text-xs text-[var(--cardiac-600)]">
                      {fieldErrors.confirmPassword}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/50 p-4">
                <label className="flex cursor-pointer items-start gap-3 text-xs text-[var(--ink-700)]">
                  <Checkbox id="consent" name="consent" required className="mt-0.5" />
                  <span className="leading-relaxed">{t("auth.consent")}</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 text-xs text-[var(--ink-700)]">
                  <Checkbox id="adult" name="adult" required className="mt-0.5" />
                  <span className="leading-relaxed">{t("auth.adult")}</span>
                </label>
              </div>

              <Button type="submit" className="group w-full" disabled={submitting}>
                {submitting ? "Creating account..." : t("auth.submitRegister")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>

            <div className="mt-8 border-t border-[var(--cardiac-100)] pt-6 text-center text-xs text-[var(--ink-500)]">
              {t("auth.haveAccount")}{" "}
              <Link
                className="font-bold text-[var(--cardiac-600)] transition-colors hover:text-[var(--cardiac-800)] hover:underline"
                href="/login"
              >
                {t("nav.signIn")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
