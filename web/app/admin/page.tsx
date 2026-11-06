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

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Counter } from "@/components/motion/counter";
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
    { label: t("admin.users"), value: stats.counts.users, icon: Users, tone: "bg-[var(--ink-100)] text-[var(--ink-700)]" },
    { label: t("admin.predictions"), value: stats.counts.predictions, icon: Activity, tone: "bg-[var(--cardiac-50)] text-[var(--cardiac-600)]" },
    { label: t("admin.indexedChunks"), value: stats.indexedChunks ?? 0, icon: Cpu, tone: "bg-[var(--cardiac-100)] text-[var(--cardiac-800)]" },
    { label: t("admin.documents"), value: stats.counts.readyDocuments, icon: FileText, tone: "bg-[var(--ink-100)] text-[var(--ink-700)]" },
    { label: t("admin.hospitals"), value: stats.counts.hospitals, icon: Building2, tone: "bg-[var(--cardiac-50)] text-[var(--cardiac-600)]" },
    { label: t("admin.doctors"), value: stats.counts.doctors, icon: Stethoscope, tone: "bg-emerald-50 text-emerald-600" },
    { label: t("admin.emergencies"), value: stats.counts.emergencies, icon: ShieldAlert, tone: "bg-red-50 text-red-600" },
  ];

  const chartData = [
    { name: "Low", value: stats.riskDistribution.LOW, color: "#10b981" },
    { name: "Moderate", value: stats.riskDistribution.MODERATE, color: "#f59e0b" },
    { name: "High", value: stats.riskDistribution.HIGH, color: "#de1145" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Activity}
        title={t("admin.stats")}
        subtitle="Real-time platform metrics across patient screenings, clinical content, and cardiac facility coverage."
      />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="group">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${card.tone}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--ink-500)]">{card.label}</p>
                  <p className="mt-0.5 text-2xl font-black tracking-tight text-[var(--ink-900)]">
                    <Counter value={Number(card.value) || 0} />
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-[var(--cardiac-600)]" />
            {t("admin.riskDistribution")}
          </CardTitle>
          <p className="text-xs text-[var(--ink-500)]">
            Cleveland-calibrated risk stratification across all recorded patient screenings
          </p>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ea" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7a5560" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#7a5560" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  borderColor: "#ffc6cf",
                  fontSize: "12px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
                cursor={{ fill: "rgba(222,17,69,0.06)" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-[var(--cardiac-600)]" />
            {t("admin.recentFeedback")}
          </CardTitle>
          <p className="text-xs text-[var(--ink-500)]">
            Real-time patient ratings and triage remarks
          </p>
        </CardHeader>
        <CardContent>
          {stats.recentFeedback.length === 0 ? (
            <p className="text-xs text-[var(--ink-500)]">{t("admin.noData")}</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.recentFeedback.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border border-[var(--cardiac-100)] bg-[var(--cardiac-50)]/40 p-3.5 text-xs"
                >
                  <div className="flex shrink-0 items-center gap-1 font-black text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{item.rating ?? "—"}</span>
                  </div>
                  <span className="leading-relaxed text-[var(--ink-700)]">
                    {item.comment || <em className="text-[var(--ink-300)]">No written remark provided</em>}
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
