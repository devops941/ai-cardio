"use client";

import Link from "next/link";
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
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">{t("history.empty")}</p>
        <Button asChild>
          <Link href="/check">{t("check.title")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{t("history.title")}</caption>
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3">{t("history.date")}</th>
              <th scope="col" className="px-4 py-3">{t("history.risk")}</th>
              <th scope="col" className="px-4 py-3">{t("history.emergency")}</th>
              <th scope="col" className="px-4 py-3">{t("history.status")}</th>
              <th scope="col" className="px-4 py-3">{t("history.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <RiskBadge risk={(row.finalRisk as "LOW" | "MODERATE" | "HIGH" | null) ?? null} />
                </td>
                <td className="px-4 py-3">{row.emergency ? t("history.yes") : t("history.no")}</td>
                <td className="px-4 py-3">{t(`status.${row.status}`) ?? row.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/result/${row.id}`}>{t("result.viewDetails")}</Link>
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => remove(row.id)}>
                      {t("result.delete")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
