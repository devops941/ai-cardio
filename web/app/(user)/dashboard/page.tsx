import Link from "next/link";
import { Phone } from "lucide-react";

import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const last = await prisma.prediction.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("nav.dashboard")} · {user.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">{t("tagline")}</p>
          <Button asChild>
            <Link href="/check">{t("check.title")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("result.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {last ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge risk={(last.finalRisk as "LOW" | "MODERATE" | "HIGH" | null) ?? null} />
                <span className="text-sm text-slate-600">
                  {new Date(last.createdAt).toLocaleString()}
                </span>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/result/${last.id}`}>{t("result.viewDetails")}</Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-600">{t("history.empty")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("fields.emergencyNumbers")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href="tel:108" className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
            <Phone aria-hidden className="h-5 w-5" /> 108
          </a>
          <a href="tel:112" className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
            <Phone aria-hidden className="h-5 w-5" /> 112
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
