"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

export const HospitalMapDynamic = dynamic(() => import("@/components/map/hospital-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});
