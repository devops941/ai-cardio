"use client";

import Link from "next/link";
import { AlertCircle, ExternalLink, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RiskBadge } from "@/components/risk-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

export interface HistoryRow {
  id: string;
  createdAt: string;
  finalRisk: string | null;
  emergency: boolean;
  status: string;
}

export function HistoryTable({ initialRows }: { initialRows: HistoryRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await apiFetch(`/api/predictions/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((row) => row.id !== id));
      toast.success("Assessment deleted successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
      toast.error(message);
    }
  }

  function requestDelete(id: string) {
    setPendingDeleteId(id);
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/40 p-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cardiac-100)] text-[var(--cardiac-600)]">
          <Heart className="h-8 w-8 animate-heartbeat" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-[var(--ink-900)]">
          No assessment records found
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--ink-500)]">
          {t("history.empty")} Start your first proactive cardiovascular evaluation today.
        </p>
        <Button asChild size="sm" className="mt-6">
          <Link href="/check">{t("check.title")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ConfirmDeleteDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
        title={t("result.delete")}
        description={t("result.confirmDelete")}
        onConfirm={handleConfirmDelete}
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="overflow-hidden rounded-md border border-[var(--cardiac-100)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{t("history.title")}</caption>
            <thead className="border-b border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/70 font-bold text-[var(--ink-700)]">
              <tr>
                <th scope="col" className="px-5 py-4">{t("history.date")}</th>
                <th scope="col" className="px-5 py-4">{t("history.risk")}</th>
                <th scope="col" className="px-5 py-4">{t("history.emergency")}</th>
                <th scope="col" className="px-5 py-4">{t("history.status")}</th>
                <th scope="col" className="px-5 py-4 text-right">{t("history.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cardiac-50)] text-[var(--ink-700)]">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[var(--cardiac-50)]/40">
                  <td className="px-5 py-4 font-semibold text-[var(--ink-900)]">
                    {new Date(row.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge risk={(row.finalRisk as "LOW" | "MODERATE" | "HIGH" | null) ?? null} />
                  </td>
                  <td className="px-5 py-4">
                    {row.emergency ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cardiac-100)] px-2.5 py-1 text-[11px] font-bold text-[var(--cardiac-800)]">
                        <AlertCircle className="h-3 w-3" />
                        {t("history.yes")}
                      </span>
                    ) : (
                      <span className="font-medium text-[var(--ink-300)]">{t("history.no")}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-[var(--ink-50)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-700)]">
                      {t(`status.${row.status}`) ?? row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/result/${row.id}`} className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span>{t("result.viewDetails")}</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => requestDelete(row.id)}
                        className="h-8 w-8 p-0 text-[var(--ink-300)] hover:bg-[var(--cardiac-50)] hover:text-[var(--cardiac-600)]"
                        title={t("result.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">{t("result.delete")}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
