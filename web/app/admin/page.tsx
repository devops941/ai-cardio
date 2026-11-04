"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { t } from "@/lib/i18n";

interface Stats {
  counts: {
    users: number;
    hospitals: number;
    doctors: number;
    readyDocuments: number;
    predictions: number;
    emergencies: number;
  };
  riskDistribution: { LOW: number; MODERATE: number; HIGH: number; UNKNOWN: number };
  indexedChunks: number | null;
  llmFallbackCount: number;
  recentFeedback: { id: string; rating: number | null; comment: string | null }[];
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : t("errors.generic")));
  }, []);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!stats) return <Skeleton className="h-64 w-full" />;

  const cards = [
    { label: t("admin.users"), value: stats.counts.users },
    { label: t("admin.predictions"), value: stats.counts.predictions },
    { label: t("admin.indexedChunks"), value: stats.indexedChunks ?? "—" },
    { label: t("admin.documents"), value: stats.counts.readyDocuments },
    { label: t("admin.hospitals"), value: stats.counts.hospitals },
    { label: t("admin.doctors"), value: stats.counts.doctors },
    { label: t("admin.emergencies"), value: stats.counts.emergencies },
  ];

  const chartData = [
    { name: "Low", value: stats.riskDistribution.LOW },
    { name: "Moderate", value: stats.riskDistribution.MODERATE },
    { name: "High", value: stats.riskDistribution.HIGH },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <p className="text-sm text-slate-600">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.riskDistribution")}</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.recentFeedback")}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentFeedback.length === 0 ? (
            <p className="text-sm text-slate-600">{t("admin.noData")}</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-700">
              {stats.recentFeedback.map((item) => (
                <li key={item.id}>
                  {item.rating ?? "—"} ★ {item.comment ? `— ${item.comment}` : ""}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
