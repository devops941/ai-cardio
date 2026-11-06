"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ShieldCheck, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmpty, AdminTable, AdminTableCard } from "@/components/admin/admin-table";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <AdminPageHeader
        icon={Users}
        title={t("admin.users")}
        subtitle="Registered patient accounts, role authorization, and evaluation counts."
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      <AdminTableCard
        icon={Users}
        title={t("admin.users")}
        subtitle="Search and page through registered accounts"
        action={
          <div className="relative w-full sm:w-64">
            <Input
              id="q"
              placeholder="Search name or email..."
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              className="pl-10"
            />
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[var(--ink-300)]" />
          </div>
        }
      >
        {data === null ? (
          <Skeleton className="h-40 w-full" />
        ) : data.items.length === 0 ? (
          <AdminEmpty label={t("admin.noData")} />
        ) : (
          <div className="space-y-4">
            <AdminTable head={[t("fields.name"), t("fields.email"), t("fields.role"), t("admin.predictions"), t("fields.joined")]}>
              {data.items.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[var(--cardiac-50)]/40">
                  <td className="px-4 py-3.5 font-semibold text-[var(--ink-900)]">{row.name ?? "—"}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-[var(--ink-500)]">{row.email}</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={row.role === "ADMIN" ? "cardiac" : "slate"}>
                      {row.role === "ADMIN" ? (
                        <span className="flex items-center gap-1 font-bold text-[var(--cardiac-800)]">
                          <ShieldCheck className="h-3 w-3" /> ADMIN
                        </span>
                      ) : (
                        row.role
                      )}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-[var(--ink-900)]">
                    {row._count.predictions}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--ink-500)]">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </AdminTable>

            <div className="flex items-center justify-between text-xs text-[var(--ink-500)]">
              <span>
                {t("fields.page")} {data.page} {t("fields.of")} {data.totalPages} · {data.total}{" "}
                {t("fields.total")}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  {t("fields.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("fields.next")}
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </AdminTableCard>
    </div>
  );
}
