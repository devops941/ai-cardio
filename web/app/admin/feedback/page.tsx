"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Star } from "lucide-react";

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

      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <MessageSquare className="h-4 w-4 text-rose-600" />
            {t("admin.feedback")}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Patient sentiment analysis, clinical usability feedback, and user reviews
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="w-full max-w-xs space-y-1">
              <Label htmlFor="rating" className="text-xs">{t("fields.rating")}</Label>
              <Select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="">{t("fields.all")}</option>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value > 1 ? "s" : ""}
                  </option>
                ))}
              </Select>
            </div>
            {average && !Number.isNaN(Number(average)) ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span>
                  {t("fields.averageRating")}: {average} ({rows?.length} {t("fields.entries")})
                </span>
              </div>
            ) : null}
          </div>

          {rows === null ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : rows.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">{t("admin.noData")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 font-semibold text-slate-700 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t("fields.date")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.user")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.rating")}</th>
                    <th scope="col" className="px-4 py-3">{t("fields.comment")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(row.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{row.user?.email ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">
                        {row.rating ? `★ ${row.rating}` : "—"}
                      </td>
                      <td className="px-4 py-3 leading-relaxed text-slate-800">
                        {row.comment ?? <em className="text-slate-400">No comment</em>}
                      </td>
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
