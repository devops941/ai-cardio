import { HospitalBrowser } from "@/components/hospital-browser";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("hospitals.title")}</h1>
      <p className="text-sm text-slate-600">{t("hospitals.searchIntro")}</p>
      <HospitalBrowser initialCity={profile?.city ?? ""} />
    </div>
  );
}
