"use client";

import { useCallback, useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface FeedbackRow {
  id: string;
  createdAt: string;
  predictionId: string | null;
  rating: number | null;
  comment: string | null;
  user: { id: string; name: string | null; email: string } | null;
}

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[] | null>(null);
  const [rating, setRating] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const query = rating ? `?rating=${rating}` : "";
      const data = await apiFetch<{ items: FeedbackRow[] }>(`/api/admin/feedback${query}`);
      setRows(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }, [rating]);

  useEffect(() => {
    void load();
  }, [load]);

  const average =
    rows && rows.length > 0
      ? (
          rows.reduce((sum, row) => sum + (row.rating ?? 0), 0) /
          rows.filter((row) => row.rating !== null).length
        ).toFixed(2)
      : null;

  return (
    <div className="space-y-6">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.feedback")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="rating">{t("fields.rating")}</Label>
              <Select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="">{t("fields.all")}</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value > 1 ? "s" : ""}
                  </option>
                ))}
              </Select>
            </div>
            {average && !Number.isNaN(Number(average)) ? (
              <p className="text-sm text-slate-600">
                {t("fields.averageRating")}: <span className="font-semibold">{average}</span> ({rows?.length} {t("fields.entries")})
              </p>
            ) : null}
          </div>

          {rows === null ? (
            <Skeleton className="h-40 w-full" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-600">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th scope="col" className="px-3 py-2">{t("fields.date")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.user")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.rating")}</th>
                    <th scope="col" className="px-3 py-2">{t("fields.comment")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{row.user?.email ?? "—"}</td>
                      <td className="px-3 py-2">{row.rating ?? "—"}</td>
                      <td className="px-3 py-2">{row.comment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
