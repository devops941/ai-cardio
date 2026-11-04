"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, BarChart2, CheckCircle2, Cpu, Play, RefreshCw, Zap } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface VersionRow {
  id: string;
  version: number;
  algorithm: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  rocAuc: number | null;
  isActive: boolean;
  metrics: Record<string, unknown> | null;
  createdAt: string;
}

interface VersionsResponse {
  versions: VersionRow[];
  activeVersion: number | null;
  aiReachable: boolean;
}

interface ComparisonRow {
  algorithm: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  roc_auc?: number;
}

interface ImportanceRow {
  feature: string;
  importance: number;
}

function percent(value: number | null | undefined): string {
  return typeof value === "number" ? `${(value * 100).toFixed(2)}%` : "—";
}

export default function AdminMlPage() {
  const [data, setData] = useState<VersionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await apiFetch<VersionsResponse>("/api/admin/ml/versions"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function train() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/admin/ml/train", { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  async function activate(version: number) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/ml/activate/${version}`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setBusy(false);
    }
  }

  const active = data?.versions.find((v) => v.isActive) ?? null;
  const metrics = (active?.metrics ?? {}) as {
    comparison?: ComparisonRow[];
    feature_importances?: ImportanceRow[];
    confusion_matrix?: number[][];
  };

  return (
    <div className="space-y-6">
      {error ? <Alert tone="error">{error}</Alert> : null}
      {data && !data.aiReachable ? (
        <Alert tone="warning">
          {t("admin.aiUnreachable")}
        </Alert>
      ) : null}

      {/* Model Training & Registry Header */}
      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Cpu className="h-4 w-4 text-rose-600" />
                {t("admin.ml")}
              </CardTitle>
              <p className="text-xs text-slate-500">
                Cleveland cardiovascular dataset ML model pipeline and automated retraining
              </p>
            </div>
            <div className="flex items-center gap-3">
              {data?.activeVersion !== null && data?.activeVersion !== undefined ? (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Active: v{data.activeVersion}
                </div>
              ) : null}
              <Button onClick={train} disabled={busy} size="sm" className="gap-2 rounded-xl">
                <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                {busy ? t("admin.training") : t("admin.train")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data === null ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : data.versions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 font-semibold text-slate-700 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t("admin.version")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.algorithm")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.accuracy")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.precision")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.recall")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.f1")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.rocAuc")}</th>
                    <th scope="col" className="px-4 py-3 text-right">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.versions.map((row) => (
                    <tr key={row.id} className={row.isActive ? "bg-rose-50/30" : "hover:bg-slate-50/40"}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        v{row.version} {row.isActive ? <Badge tone="green" className="ml-1.5">{t("admin.active")}</Badge> : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] uppercase text-rose-700 font-medium">{row.algorithm}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{percent(row.accuracy)}</td>
                      <td className="px-4 py-3">{percent(row.precision)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{percent(row.recall)}</td>
                      <td className="px-4 py-3">{percent(row.f1)}</td>
                      <td className="px-4 py-3 font-semibold text-rose-700">{percent(row.rocAuc)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy || row.isActive}
                          onClick={() => activate(row.version)}
                          className="h-7 text-xs rounded-lg"
                        >
                          {row.isActive ? "Live" : t("admin.activate")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Benchmark Comparison */}
      {metrics.comparison && metrics.comparison.length > 0 ? (
        <Card className="border-rose-100 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <BarChart2 className="h-4 w-4 text-rose-600" />
              {t("admin.comparison")}
            </CardTitle>
            <p className="text-xs text-slate-500">Cross-algorithm benchmarks evaluated during training run</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 font-semibold text-slate-700 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">Algorithm</th>
                    <th scope="col" className="px-4 py-3">{t("admin.accuracy")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.precision")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.recall")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.f1")}</th>
                    <th scope="col" className="px-4 py-3">{t("admin.rocAuc")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {metrics.comparison.map((row) => (
                    <tr key={row.algorithm} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 font-semibold text-slate-900 uppercase font-mono text-[11px]">{row.algorithm}</td>
                      <td className="px-4 py-3">{percent(row.accuracy ?? null)}</td>
                      <td className="px-4 py-3">{percent(row.precision ?? null)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{percent(row.recall ?? null)}</td>
                      <td className="px-4 py-3">{percent(row.f1 ?? null)}</td>
                      <td className="px-4 py-3 font-semibold text-rose-700">{percent(row.roc_auc ?? null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Feature Importances & Confusion Matrix */}
      <div className="grid gap-6 lg:grid-cols-2">
        {metrics.feature_importances && metrics.feature_importances.length > 0 ? (
          <Card className="border-rose-100 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Zap className="h-4 w-4 text-rose-600" />
                {t("admin.importances")}
              </CardTitle>
              <p className="text-xs text-slate-500">Key physiological variables influencing cardiac risk</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-xs">
                {metrics.feature_importances.slice(0, 8).map((row) => {
                  const pct = Math.round(row.importance * 100);
                  return (
                    <li key={row.feature} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-medium text-slate-900">{row.feature}</span>
                        <span className="font-mono text-[11px] font-semibold text-rose-700">
                          {(row.importance * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-700 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {metrics.confusion_matrix ? (
          <Card className="border-rose-100 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Activity className="h-4 w-4 text-rose-600" />
                {t("admin.confusionMatrix")}
              </CardTitle>
              <p className="text-xs text-slate-500">True Negative vs True Positive validation counts</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <table className="w-full text-xs text-center">
                  <thead>
                    <tr>
                      <th className="p-2 text-slate-400 font-normal">Predicted \ Actual</th>
                      <th className="p-2 font-semibold text-slate-700">Actual Negative (0)</th>
                      <th className="p-2 font-semibold text-slate-700">Actual Positive (1)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.confusion_matrix.map((row, i) => (
                      <tr key={i} className="border-t border-slate-200/60">
                        <td className="p-3 font-semibold text-slate-700">
                          {i === 0 ? "Predicted Negative (0)" : "Predicted Positive (1)"}
                        </td>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`p-3 font-mono font-bold text-sm ${
                              (i === 0 && j === 0) || (i === 1 && j === 1)
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-rose-50 text-rose-800"
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
