"use client";

import { HeartPulse, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Card className="w-full max-w-md border-[var(--cardiac-200)]">
        {/* Top accent bar */}
        <div className="h-1.5 w-full rounded-t-lg bg-gradient-to-r from-[var(--cardiac-500)] via-[var(--cardiac-600)] to-[var(--cardiac-800)]" />

        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--cardiac-50)] text-[var(--cardiac-600)]">
              <HeartPulse className="h-5 w-5" />
            </span>
            <CardTitle className="text-[var(--cardiac-800)]">
              {t("appName")} — Unexpected error
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-[var(--ink-500)]">
            {t("errors.generic")} We apologise for the interruption. No health data was lost.
          </p>

          {error.digest && (
            <p className="rounded-md bg-[var(--ink-50)] px-3 py-2 font-mono text-[11px] text-[var(--ink-500)]">
              Ref: {error.digest}
            </p>
          )}
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
