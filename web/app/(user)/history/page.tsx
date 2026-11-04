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
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("history.title")}</h1>
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
