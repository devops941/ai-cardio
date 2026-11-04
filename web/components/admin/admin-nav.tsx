"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", key: "admin.stats" },
  { href: "/admin/documents", key: "admin.documents" },
  { href: "/admin/hospitals", key: "admin.hospitals" },
  { href: "/admin/doctors", key: "admin.doctors" },
  { href: "/admin/ml", key: "admin.ml" },
  { href: "/admin/users", key: "admin.users" },
  { href: "/admin/feedback", key: "admin.feedback" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label={t("a11y.adminNav")} className="space-y-1">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "block rounded-md px-3 py-2 text-sm font-medium",
            pathname === link.href
              ? "bg-blue-700 text-white"
              : "text-slate-700 hover:bg-slate-100",
          )}
        >
          {t(link.key)}
        </Link>
      ))}
    </nav>
  );
}
