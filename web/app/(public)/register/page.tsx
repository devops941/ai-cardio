"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Heart, Lock, Mail, ShieldCheck, Stethoscope, User } from "lucide-react";
import { useState } from "react";

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
    <div className="flex items-center justify-center px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-xl shadow-rose-950/5">
        <div className="grid md:grid-cols-12">
          {/* Left Side: Medical Visual Banner */}
          <div className="relative hidden md:col-span-5 md:block bg-gradient-to-br from-rose-900 via-rose-950 to-slate-900 p-8 text-white">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rose-200 backdrop-blur-xs">
                  <Heart className="h-3.5 w-3.5 text-rose-400 heartbeat" />
                  Patient Registration
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Join CardioCare</h2>
                <p className="text-xs leading-relaxed text-rose-100/80">
                  Create your profile to access intelligent cardiac risk scoring, save medical histories, and locate certified cath labs.
                </p>
              </div>

              <div className="relative my-6 h-48 w-full overflow-hidden rounded-2xl border border-white/10 shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80"
                  alt="Medical professional examining cardiovascular care"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    HIPAA/GDPR Principles
                  </span>
                  <span className="text-rose-200">256-bit Security</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4 text-[11px] text-rose-200/90">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 text-rose-400" />
                  <span>Personalized cardiac risk evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-rose-400" />
                  <span>Confidential, non-diagnostic guidance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="p-8 md:col-span-7 sm:p-10">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("auth.registerTitle")}</h1>
              <p className="text-xs text-slate-500">
                Complete your details below to activate your cardiovascular assessment account.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {error ? <Alert tone="error">{error}</Alert> : null}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-slate-700">{t("auth.name")}</Label>
                <div className="relative">
                  <Input id="name" name="name" placeholder="Full name" required aria-describedby="name-error" className="pl-9" />
                  <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
                {fieldErrors.name ? <p id="name-error" className="text-xs text-rose-600">{fieldErrors.name}</p> : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-700">{t("auth.email")}</Label>
                <div className="relative">
                  <Input id="email" name="email" type="email" placeholder="patient@cardiacare.org" autoComplete="email" required aria-describedby="email-error" className="pl-9" />
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>
                {fieldErrors.email ? <p id="email-error" className="text-xs text-rose-600">{fieldErrors.email}</p> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-700">{t("auth.password")}</Label>
                  <div className="relative">
                    <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required aria-describedby="password-error" className="pl-9" />
                    <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                  {fieldErrors.password ? <p id="password-error" className="text-xs text-rose-600">{fieldErrors.password}</p> : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700">{t("auth.confirmPassword")}</Label>
                  <div className="relative">
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" required aria-describedby="confirm-error" className="pl-9" />
                    <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                  {fieldErrors.confirmPassword ? <p id="confirm-error" className="text-xs text-rose-600">{fieldErrors.confirmPassword}</p> : null}
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                  <Checkbox id="consent" name="consent" required className="mt-0.5" />
                  <span>{t("auth.consent")}</span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                  <Checkbox id="adult" name="adult" required className="mt-0.5" />
                  <span>{t("auth.adult")}</span>
                </label>
              </div>

              <Button type="submit" className="w-full gap-2 rounded-xl shadow-md shadow-rose-600/20" disabled={submitting}>
                {submitting ? "Creating account..." : t("auth.submitRegister")}
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
              {t("auth.haveAccount")}{" "}
              <Link className="font-semibold text-rose-600 hover:text-rose-700 hover:underline" href="/login">
                {t("nav.signIn")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
