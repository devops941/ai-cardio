"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ShieldCheck, Users } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { predictions: number };
}

interface UsersResponse {
  items: UserRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (query) params.set("q", query);
      setData(await apiFetch<UsersResponse>(`/api/admin/users?${params.toString()}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
    }
  }, [page, query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Users className="h-4 w-4 text-rose-600" />
            {t("admin.users")}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Registered patient accounts, role authorization, and evaluation counts
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Input
              id="q"
              placeholder="Search by name or email address..."
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              className="pl-9"
            />
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>

          {data === null ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : data.items.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">{t("admin.noData")}</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 font-semibold text-slate-700 border-b border-slate-100">
                    <tr>
                      <th scope="col" className="px-4 py-3">{t("fields.name")}</th>
                      <th scope="col" className="px-4 py-3">{t("fields.email")}</th>
                      <th scope="col" className="px-4 py-3">{t("fields.role")}</th>
                      <th scope="col" className="px-4 py-3">{t("admin.predictions")}</th>
                      <th scope="col" className="px-4 py-3">{t("fields.joined")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.items.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.name ?? "—"}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{row.email}</td>
                        <td className="px-4 py-3">
                          <Badge tone={row.role === "ADMIN" ? "rose" : "slate"}>
                            {row.role === "ADMIN" ? (
                              <span className="flex items-center gap-1 font-bold text-rose-800">
                                <ShieldCheck className="h-3 w-3" /> ADMIN
                              </span>
                            ) : (
                              row.role
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{row._count.predictions}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>
                  {t("fields.page")} {data.page} {t("fields.of")} {data.totalPages} · {data.total} {t("fields.total")}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 rounded-xl"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    {t("fields.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 rounded-xl"
                  >
                    {t("fields.next")}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
