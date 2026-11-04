"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Activity, Heart, Menu, PhoneCall, UserCheck, X } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Brand Logo with Heartbeat */}
        <Link
          href={session?.user ? "/dashboard" : "/"}
          className="group flex items-center gap-2.5 font-bold tracking-tight text-slate-900 transition-transform active:scale-95"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-500/25 transition-transform group-hover:scale-105">
            <Heart aria-hidden className="h-5 w-5 text-white animate-heartbeat fill-white/20" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-none">
              Cardio<span className="text-rose-600">Care</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">
              Heart Screening AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label={t("a11y.mainNav")} className="hidden items-center gap-1.5 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150",
                  active
                    ? "bg-rose-50 text-rose-700 font-bold shadow-xs border border-rose-200/60"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden items-center gap-2.5 md:flex">
          {/* Quick 108 Emergency Callout */}
          <a
            href="tel:108"
            title="Emergency Medical Hotline"
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-300"
          >
            <PhoneCall className="h-3.5 w-3.5 text-red-600 animate-pulse" />
            <span>108</span>
          </a>

          {status === "loading" ? null : session?.user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <span className="max-w-[10rem] truncate text-xs font-medium text-slate-600" title={session.user.email ?? ""}>
                {session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs"
              >
                {t("nav.signOut")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("nav.signIn")}</Link>
              </Button>
              <Button size="sm" asChild className="shadow-rose-600/20">
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Nav Toggle Button */}
        <button
          type="button"
          aria-label={t("a11y.toggleNav")}
          aria-expanded={open}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200/70 bg-rose-50/50 text-slate-700 md:hidden transition-colors hover:bg-rose-100/60"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden className="h-5 w-5 text-rose-700" /> : <Menu aria-hidden className="h-5 w-5 text-slate-700" />}
        </button>
      </div>

      {/* Mobile Dropdown Nav Menu */}
      {open ? (
        <nav
          aria-label={t("a11y.mobileNav")}
          className="border-t border-rose-100 bg-white/98 backdrop-blur-lg px-4 py-3 md:hidden shadow-xl"
        >
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  pathname === link.href ? "bg-rose-50 text-rose-700 font-bold" : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <a
              href="tel:108"
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Emergency Ambulance: Call 108</span>
            </a>

            {session?.user ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full rounded-xl px-3.5 py-2.5 text-center text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-100"
              >
                {t("nav.signOut")} ({session.user.email})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-rose-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-rose-700 shadow-sm"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
