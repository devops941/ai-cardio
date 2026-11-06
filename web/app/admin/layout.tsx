import { ShieldAlert } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <aside className="lg:w-72 lg:shrink-0">
          <div className="sticky top-28 space-y-4">
            <div className="relative overflow-hidden rounded-lg cardiac-mesh p-5 text-white">
              <div className="relative flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/15">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </span>
                <div>
                  <h1 className="text-sm font-black tracking-tight">{t("admin.title")}</h1>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--cardiac-200)]">
                    Control Center
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--cardiac-100)] bg-white p-3 shadow-sm">
              <AdminNav />
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
