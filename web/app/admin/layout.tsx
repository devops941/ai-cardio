import { ShieldAlert } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
      <aside className="lg:w-64 lg:shrink-0 space-y-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <h1 className="text-sm font-bold text-slate-900">{t("admin.title")}</h1>
          </div>
          <AdminNav />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
