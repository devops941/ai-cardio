"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const USER_LINKS = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/check", key: "nav.check" },
  { href: "/hospitals", key: "nav.hospitals" },
  { href: "/history", key: "nav.history" },
  { href: "/profile", key: "nav.profile" },
  { href: "/feedback", key: "nav.feedback" },
];

export function SiteHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = session?.user?.role === "ADMIN"
    ? [{ href: "/admin", key: "nav.admin" }]
    : USER_LINKS;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={session?.user ? "/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-slate-900">
          <Heart aria-hidden className="h-6 w-6 text-red-600" />
          {t("appName")}
        </Link>

        <nav aria-label={t("a11y.mainNav")} className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100",
                pathname === link.href ? "text-blue-700" : "text-slate-700",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? null : session?.user ? (
            <>
              <span className="max-w-[12rem] truncate text-sm text-slate-600">{session.user.email}</span>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("nav.signIn")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={t("a11y.toggleNav")}
          aria-expanded={open}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav aria-label={t("a11y.mobileNav")} className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t(link.key)}
            </Link>
          ))}
          {session?.user ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full rounded-md px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {t("nav.signOut")}
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {t("nav.signIn")}
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {t("nav.register")}
              </Link>
            </>
          )}
        </nav>
      ) : null}
    </header>
  );
}
