"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.registerTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {error ? <Alert tone="error">{error}</Alert> : null}
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input id="name" name="name" required aria-describedby="name-error" />
              {fieldErrors.name ? <p id="name-error" className="text-sm text-red-700">{fieldErrors.name}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required aria-describedby="email-error" />
              {fieldErrors.email ? <p id="email-error" className="text-sm text-red-700">{fieldErrors.email}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required aria-describedby="password-error" />
              {fieldErrors.password ? <p id="password-error" className="text-sm text-red-700">{fieldErrors.password}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required aria-describedby="confirm-error" />
              {fieldErrors.confirmPassword ? <p id="confirm-error" className="text-sm text-red-700">{fieldErrors.confirmPassword}</p> : null}
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="consent" name="consent" required />
              <Label htmlFor="consent" className="font-normal">{t("auth.consent")}</Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="adult" name="adult" required />
              <Label htmlFor="adult" className="font-normal">{t("auth.adult")}</Label>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {t("auth.submitRegister")}
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            {t("auth.haveAccount")}{" "}
            <Link className="font-medium text-blue-700 hover:underline" href="/login">
              {t("nav.signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
