import Link from "next/link";
import { Heart, Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-[var(--cardiac-100)] text-center">
        {/* Top accent bar */}
        <div className="h-1.5 w-full rounded-t-lg bg-gradient-to-r from-[var(--cardiac-500)] via-[var(--cardiac-600)] to-[var(--cardiac-800)]" />

        <CardContent className="space-y-6 px-8 py-10">
          {/* Icon cluster */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[var(--cardiac-100)] opacity-60" />
            <span className="absolute inset-2 rounded-full bg-[var(--cardiac-50)]" />
            <SearchX className="relative h-9 w-9 text-[var(--cardiac-500)]" />
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <p className="text-6xl font-black tracking-tight text-[var(--cardiac-200)]">404</p>
            <h1 className="text-xl font-bold text-[var(--ink-900)]">Page not found</h1>
            <p className="text-sm leading-relaxed text-[var(--ink-500)]">
              The page you are looking for doesn&apos;t exist or has been moved. No health data was
              affected.
            </p>
          </div>

          {/* Back home CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="default" size="default">
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                {t("nav.dashboard")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="default">
              <Link href="/" className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-[var(--cardiac-600)]" />
                {t("appName")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
