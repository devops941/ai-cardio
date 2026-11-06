"use client";

import { HeartPulse, Phone, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center justify-center px-4 py-16">
      <Card className="w-full border-[var(--cardiac-200)]">
        {/* Top accent bar */}
        <div className="h-1.5 w-full rounded-t-lg bg-gradient-to-r from-[var(--cardiac-500)] via-[var(--cardiac-600)] to-[var(--cardiac-800)]" />

        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--cardiac-50)] text-[var(--cardiac-600)]">
              <HeartPulse className="h-5 w-5" />
            </span>
            <CardTitle className="text-[var(--cardiac-800)]">Something went wrong</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <p className="text-sm leading-relaxed text-[var(--ink-500)]">
            {t("errors.generic")} If you were viewing a health result, your data is safe — please
            try again.
          </p>

          {error.digest && (
            <p className="rounded-md bg-[var(--ink-50)] px-3 py-2 font-mono text-[11px] text-[var(--ink-500)]">
              Ref: {error.digest}
            </p>
          )}

          {/* Emergency guidance — clinical requirement */}
          <div className="rounded-md border border-[var(--cardiac-200)] bg-[var(--cardiac-50)] p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--cardiac-700)]">
              Experiencing a cardiac emergency?
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--cardiac-600)] to-[var(--cardiac-800)] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105"
              >
                <Phone className="h-3.5 w-3.5" />
                108 — Ambulance
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cardiac-300)] bg-white px-4 py-1.5 text-xs font-bold text-[var(--cardiac-700)] transition-colors hover:bg-[var(--cardiac-100)]"
              >
                <Phone className="h-3.5 w-3.5" />
                112 — Emergency
              </a>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--ink-500)]">
              {t("disclaimer")}
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={reset} className="w-full" variant="default">
            <RefreshCw className="h-4 w-4" />
            {t("errors.tryAgain")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
