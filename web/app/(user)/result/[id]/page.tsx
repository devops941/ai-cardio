import { notFound } from "next/navigation";

import { ReportView, type SerializedPrediction } from "@/components/result/report-view";
import { requireUser } from "@/lib/auth";
import { findRankedHospitals } from "@/lib/hospitals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const record = await prisma.prediction.findFirst({ where: { id, userId: user.id } });
  if (!record) notFound();

  const urgent = record.urgent || record.emergency;
  const hospitalResult =
    record.status === "non_heart" && !record.emergency
      ? { hospitals: [], meta: { mode: "none" as const, radiusKm: 25, radiusExpanded: false, urgent } }
      : await findRankedHospitals({
          lat: record.latitude,
          lng: record.longitude,
          city: record.city,
          pincode: record.pincode,
          urgent,
        });

  return (
    <ReportView
      record={JSON.parse(JSON.stringify(record)) as SerializedPrediction}
      hospitalResult={hospitalResult}
    />
  );
}
