import { Calendar, FileClock, ShieldAlert } from "lucide-react";

import { HistoryTable } from "@/components/history-table";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();
  const rows = await prisma.prediction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, createdAt: true, finalRisk: true, emergency: true, status: true },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 rounded-3xl border border-rose-100 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
            <FileClock className="h-4 w-4" />
            Patient Clinical Records
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("history.title")}</h1>
          <p className="text-xs text-slate-500">
            Track your historical cardiovascular risk assessments, emergency evaluations, and triage outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-2xl border border-rose-200/60 bg-rose-50/50 px-4 py-2 text-xs font-semibold text-rose-700 sm:self-center">
          <Calendar className="h-4 w-4" />
          <span>{rows.length} Total Assessments</span>
        </div>
      </div>

      <HistoryTable
        initialRows={rows.map((row) => ({
          id: row.id,
          createdAt: row.createdAt.toISOString(),
          finalRisk: row.finalRisk,
          emergency: row.emergency,
          status: row.status,
        }))}
      />
    </div>
  );
}
