import Image from "next/image";
import { Hospital, MapPin, ShieldCheck, Siren } from "lucide-react";

import { HospitalBrowser } from "@/components/hospital-browser";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Header banner */}
      <div className="relative isolate overflow-hidden rounded-[2rem] cardiac-mesh p-6 shadow-2xl sm:p-10">
        <div className="absolute inset-0 -z-10 opacity-25">
          <Image
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover mix-blend-luminosity"
          />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-8">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--cardiac-300)]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--cardiac-100)] backdrop-blur-md">
              <Hospital className="h-3.5 w-3.5 text-[var(--cardiac-300)]" />
              Accredited Clinical Directory
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {t("hospitals.title")}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--cardiac-100)]/85">
              Discover verified cardiology hospitals, cardiac catheterization labs, and emergency
              coronary care units equipped for acute myocardial infarction intervention.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-semibold text-[var(--cardiac-100)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> 24×7 emergency certified
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[var(--cardiac-300)]" /> GPS &amp; pincode geolocation
              </span>
              <span className="flex items-center gap-1.5">
                <Siren className="h-4 w-4 text-[var(--cardiac-300)]" /> Cath lab capability filter
              </span>
            </div>
          </div>

          <div className="relative hidden h-40 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-inner lg:col-span-4 lg:block">
            <Image
              src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80"
              alt="Cardiac hospital emergency facility"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover opacity-90"
            />
          </div>
        </div>
      </div>

      <HospitalBrowser initialCity={profile?.city ?? ""} />
    </div>
  );
}
