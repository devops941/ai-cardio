import Image from "next/image";
import { Hospital, MapPin, ShieldCheck } from "lucide-react";

import { HospitalBrowser } from "@/components/hospital-browser";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 p-6 text-white shadow-md md:p-8">
        <div className="relative z-10 grid gap-6 md:grid-cols-12 md:items-center">
          <div className="space-y-3 md:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-rose-200 backdrop-blur-xs">
              <Hospital className="h-3.5 w-3.5 text-rose-400" />
              Accredited Clinical Directory
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {t("hospitals.title")}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-rose-100/90 md:text-sm">
              Discover verified cardiology hospitals, cardiac catheterization labs, and emergency coronary care units equipped for acute myocardial infarction intervention.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-rose-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> 24×7 Emergency Certified
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-rose-400" /> GPS & Pincode Geolocation
              </span>
            </div>
          </div>
          <div className="hidden md:col-span-4 md:block relative h-36 w-full overflow-hidden rounded-2xl border border-white/10 shadow-inner">
            <Image
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80"
              alt="Cardiac hospital and emergency trauma center"
              fill
              className="object-cover opacity-85"
            />
          </div>
        </div>
      </div>

      <HospitalBrowser initialCity={profile?.city ?? ""} />
    </div>
  );
}
