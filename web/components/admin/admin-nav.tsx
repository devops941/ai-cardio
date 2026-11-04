"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Cpu,
  FileText,
  Hospital,
  MessageSquare,
  Stethoscope,
  Users,
} from "lucide-react";

import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", key: "admin.stats", icon: BarChart3 },
  { href: "/admin/documents", key: "admin.documents", icon: FileText },
  { href: "/admin/hospitals", key: "admin.hospitals", icon: Hospital },
  { href: "/admin/doctors", key: "admin.doctors", icon: Stethoscope },
  { href: "/admin/ml", key: "admin.ml", icon: Cpu },
  { href: "/admin/users", key: "admin.users", icon: Users },
  { href: "/admin/feedback", key: "admin.feedback", icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label={t("a11y.adminNav")} className="space-y-1">
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xs shadow-rose-600/20 font-semibold"
                : "text-slate-600 hover:bg-rose-50/60 hover:text-rose-700",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-rose-600")} />
            <span>{t(link.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
