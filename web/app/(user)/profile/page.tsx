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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("profile.title")}</h1>
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
