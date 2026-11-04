"use client";

import { useCallback, useEffect, useState } from "react";

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

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.ml")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={train} disabled={busy}>
              {busy ? t("admin.training") : t("admin.train")}
            </Button>
            {data?.activeVersion !== null && data?.activeVersion !== undefined ? (
              <p className="text-sm text-slate-600">
                {t("admin.active")}: <span className="font-semibold">v{data.activeVersion}</span>
              </p>
            ) : null}
          </div>

          {data === null ? (
            <Skeleton className="h-40 w-full" />
          ) : data.versions.length === 0 ? (
            <p className="text-sm text-slate-600">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-3 py-2">{t("admin.version")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.algorithm")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.accuracy")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.precision")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.recall")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.f1")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.rocAuc")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.versions.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        v{row.version} {row.isActive ? <Badge tone="green">{t("admin.active")}</Badge> : null}
                      </td>
                      <td className="px-3 py-2">{row.algorithm}</td>
                      <td className="px-3 py-2">{percent(row.accuracy)}</td>
                      <td className="px-3 py-2">{percent(row.precision)}</td>
                      <td className="px-3 py-2">{percent(row.recall)}</td>
                      <td className="px-3 py-2">{percent(row.f1)}</td>
                      <td className="px-3 py-2">{percent(row.rocAuc)}</td>
                      <td className="px-3 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy || row.isActive}
                          onClick={() => activate(row.version)}
                        >
                          {t("admin.activate")}
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

      {metrics.comparison && metrics.comparison.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.comparison")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-3 py-2">Algorithm</th>
                    <th scope="col" className="px-3 py-2">{t("admin.accuracy")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.precision")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.recall")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.f1")}</th>
                    <th scope="col" className="px-3 py-2">{t("admin.rocAuc")}</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.comparison.map((row) => (
                    <tr key={row.algorithm} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.algorithm}</td>
                      <td className="px-3 py-2">{percent(row.accuracy ?? null)}</td>
                      <td className="px-3 py-2">{percent(row.precision ?? null)}</td>
                      <td className="px-3 py-2">{percent(row.recall ?? null)}</td>
                      <td className="px-3 py-2">{percent(row.f1 ?? null)}</td>
                      <td className="px-3 py-2">{percent(row.roc_auc ?? null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {metrics.feature_importances && metrics.feature_importances.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.importances")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {metrics.feature_importances.slice(0, 8).map((row) => (
                  <li key={row.feature} className="flex items-center justify-between gap-4">
                    <span>{row.feature}</span>
                    <span className="font-mono text-slate-600">
                      {(row.importance * 100).toFixed(2)}%
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {metrics.confusion_matrix ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.confusionMatrix")}</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="text-sm">
                <tbody>
                  {metrics.confusion_matrix.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="border border-slate-200 px-4 py-2 text-center">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
