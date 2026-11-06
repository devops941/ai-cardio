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

  const emergencyCount = rows.filter((row) => row.emergency).length;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-md border border-[var(--cardiac-100)] bg-white p-6 shadow-sm sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--cardiac-100)]/50 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--cardiac-600)]">
              <FileClock className="h-4 w-4" />
              Patient Clinical Records
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--ink-900)]">
              {t("history.title")}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--ink-500)]">
              Track your historical cardiovascular risk assessments, emergency evaluations, and
              triage outcomes.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-md border border-[var(--cardiac-200)]/60 bg-[var(--cardiac-50)]/60 px-4 py-2.5 text-xs font-bold text-[var(--cardiac-700)]">
              <Calendar className="h-4 w-4" />
              {rows.length} total
            </div>
            {emergencyCount > 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">
                <ShieldAlert className="h-4 w-4" />
                {emergencyCount} emergency
              </div>
            ) : null}
          </div>
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
