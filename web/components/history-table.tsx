"use client";

import Link from "next/link";
import { AlertCircle, ExternalLink, Heart, Trash2 } from "lucide-react";
import { useState } from "react";

import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
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

  async function remove(id: string) {
    if (!window.confirm(t("result.confirmDelete"))) return;
    try {
      await apiFetch(`/api/predictions/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-rose-200 bg-rose-50/30 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <Heart className="h-7 w-7 heartbeat" />
        </div>
        <h3 className="mt-4 font-bold text-slate-900">No Assessment Records Found</h3>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
          {t("history.empty")} Start your first proactive cardiovascular evaluation today.
        </p>
        <Button asChild size="sm" className="mt-5 rounded-xl shadow-sm shadow-rose-500/20">
          <Link href="/check">{t("check.title")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-rose-100/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{t("history.title")}</caption>
            <thead className="border-b border-slate-100 bg-slate-50/80 font-semibold text-slate-700">
              <tr>
                <th scope="col" className="px-5 py-3.5">{t("history.date")}</th>
                <th scope="col" className="px-5 py-3.5">{t("history.risk")}</th>
                <th scope="col" className="px-5 py-3.5">{t("history.emergency")}</th>
                <th scope="col" className="px-5 py-3.5">{t("history.status")}</th>
                <th scope="col" className="px-5 py-3.5 text-right">{t("history.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-rose-50/20">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {new Date(row.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskBadge risk={(row.finalRisk as "LOW" | "MODERATE" | "HIGH" | null) ?? null} />
                  </td>
                  <td className="px-5 py-3.5">
                    {row.emergency ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                        <AlertCircle className="h-3 w-3" />
                        {t("history.yes")}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">{t("history.no")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-700">
                      {t(`status.${row.status}`) ?? row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="h-8 rounded-xl border-slate-200 hover:border-rose-300 hover:text-rose-700">
                        <Link href={`/result/${row.id}`} className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span>{t("result.viewDetails")}</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(row.id)}
                        className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
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
