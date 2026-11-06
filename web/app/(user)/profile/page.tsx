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
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="relative overflow-hidden rounded-lg border border-[var(--cardiac-100)] bg-white p-6 shadow-sm sm:p-8">
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--cardiac-600)]">
            <UserCheck className="h-4 w-4" />
            Patient Demographics &amp; Security
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--ink-900)]">
            {t("profile.title")}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--ink-500)]">
            Manage your personal profile, baseline cardiovascular parameters, and account security
            credentials.
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
