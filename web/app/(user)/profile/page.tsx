import { UserCheck } from "lucide-react";

import { ProfileForms } from "@/components/profile-forms";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, profile: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-2 rounded-3xl border border-rose-100 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
            <UserCheck className="h-4 w-4" />
            Patient Demographics & Security
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("profile.title")}</h1>
          <p className="text-xs text-slate-500">
            Manage your personal profile, baseline cardiovascular parameters, and account security credentials.
          </p>
        </div>
      </div>

      <ProfileForms
        initial={{
          name: record?.name ?? "",
          email: record?.email ?? "",
          phone: record?.profile?.phone ?? "",
          age: record?.profile?.age ?? null,
          gender: record?.profile?.gender ?? "",
          city: record?.profile?.city ?? "",
        }}
      />
    </div>
  );
}
