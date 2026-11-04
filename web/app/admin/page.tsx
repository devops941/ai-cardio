"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Building2,
  Cpu,
  FileText,
  Heart,
  MessageSquare,
  ShieldAlert,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";

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
  if (!stats) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const cards = [
    { label: t("admin.users"), value: stats.counts.users, icon: Users, tone: "text-slate-700 bg-slate-100" },
    { label: t("admin.predictions"), value: stats.counts.predictions, icon: Activity, tone: "text-rose-600 bg-rose-50" },
    { label: t("admin.indexedChunks"), value: stats.indexedChunks ?? "—", icon: Cpu, tone: "text-purple-600 bg-purple-50" },
    { label: t("admin.documents"), value: stats.counts.readyDocuments, icon: FileText, tone: "text-slate-700 bg-slate-100" },
    { label: t("admin.hospitals"), value: stats.counts.hospitals, icon: Building2, tone: "text-rose-600 bg-rose-50" },
    { label: t("admin.doctors"), value: stats.counts.doctors, icon: Stethoscope, tone: "text-emerald-600 bg-emerald-50" },
    { label: t("admin.emergencies"), value: stats.counts.emergencies, icon: ShieldAlert, tone: "text-rose-700 bg-rose-100" },
  ];

  const chartData = [
    { name: "Low Risk", value: stats.riskDistribution.LOW, color: "#10b981" },
    { name: "Moderate Risk", value: stats.riskDistribution.MODERATE, color: "#f59e0b" },
    { name: "High Risk", value: stats.riskDistribution.HIGH, color: "#e11d48" },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-rose-100/80 shadow-xs">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Distribution Chart */}
      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Heart className="h-4 w-4 text-rose-600" />
            {t("admin.riskDistribution")}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Cleveland-calibrated risk stratification across all recorded patient screenings
          </p>
        </CardHeader>
        <CardContent style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  borderColor: "#fecdd3",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Feedback Stream */}
      <Card className="border-rose-100 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <MessageSquare className="h-4 w-4 text-rose-600" />
            {t("admin.recentFeedback")}
          </CardTitle>
          <p className="text-xs text-slate-500">Real-time patient user ratings and triage remarks</p>
        </CardHeader>
        <CardContent>
          {stats.recentFeedback.length === 0 ? (
            <p className="text-xs text-slate-500">{t("admin.noData")}</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.recentFeedback.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs"
                >
                  <div className="flex items-center gap-1 font-bold text-amber-600 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{item.rating ?? "—"}</span>
                  </div>
                  <span className="text-slate-700 leading-relaxed">
                    {item.comment || <em className="text-slate-400">No written remark provided</em>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
