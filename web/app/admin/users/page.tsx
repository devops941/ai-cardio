"use client";

import { useCallback, useEffect, useState } from "react";

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

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-1">
            <Label htmlFor="q">{t("admin.search")}</Label>
            <Input
              id="q"
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
            />
          </div>

          {data === null ? (
            <Skeleton className="h-40 w-full" />
          ) : data.items.length === 0 ? (
            <p className="text-sm text-slate-600">{t("admin.noData")}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="px-3 py-2">{t("fields.name")}</th>
                      <th scope="col" className="px-3 py-2">{t("fields.email")}</th>
                      <th scope="col" className="px-3 py-2">{t("fields.role")}</th>
                      <th scope="col" className="px-3 py-2">{t("admin.predictions")}</th>
                      <th scope="col" className="px-3 py-2">{t("fields.joined")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-3 py-2">{row.name ?? "—"}</td>
                        <td className="px-3 py-2">{row.email}</td>
                        <td className="px-3 py-2">
                          <Badge tone={row.role === "ADMIN" ? "blue" : "slate"}>{row.role}</Badge>
                        </td>
                        <td className="px-3 py-2">{row._count.predictions}</td>
                        <td className="px-3 py-2">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  {t("fields.page")} {data.page} {t("fields.of")} {data.totalPages} · {data.total} {t("fields.total")}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("fields.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t("fields.next")}
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
