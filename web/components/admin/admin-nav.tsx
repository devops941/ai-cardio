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
              "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold transition-all duration-200",
              active
                ? "bg-gradient-to-r from-[var(--cardiac-600)] to-[var(--cardiac-800)] text-white shadow-md shadow-[color:rgba(222,17,69,0.3)]"
                : "text-[var(--ink-500)] hover:bg-[var(--cardiac-50)] hover:text-[var(--cardiac-700)]",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-[var(--cardiac-400)]")} />
            <span>{t(link.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
