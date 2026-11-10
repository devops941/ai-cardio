"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Activity,
  ChevronRight,
  Heart,
  Menu,
  PhoneCall,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const USER_LINKS = [
  // { href: "/dashboard", key: "nav.dashboard" },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links =
    session?.user?.role === "ADMIN" ? [{ href: "/admin", key: "nav.admin" }] : USER_LINKS;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[var(--cardiac-100)] bg-white/85 shadow-sm backdrop-blur-sm"
          : "border-b border-transparent bg-white/60 backdrop-blur-sm",
      )}
    >
      {/* ECG pulse strip */}
      <div className="ecg-track h-[3px] w-full bg-gradient-to-r from-[var(--cardiac-600)] via-[var(--cardiac-400)] to-[var(--cardiac-700)]" />

      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        {/* Brand */}
        <Link
          href={session?.user ? "/" : "/"}
          className="group flex shrink-0 items-center gap-3 transition-transform active:scale-95"
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-[var(--cardiac-500)] to-[var(--cardiac-800)] transition-transform duration-300 group-hover:scale-105">
            <span className="absolute inset-0 rounded-md bg-[var(--cardiac-400)]/40 animate-ring-ping" />
            <Heart
              aria-hidden
              className="relative h-5 w-5 animate-heartbeat fill-white/25 text-white"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tight text-[var(--ink-900)]">
              Cardio<span className="text-[var(--cardiac-600)]">Care</span>
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cardiac-500)]">
              Heart Screening AI
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label={t("a11y.mainNav")} className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-[var(--cardiac-50)] text-[var(--cardiac-700)]"
                    : "text-[var(--ink-500)] hover:bg-[var(--cardiac-50)]/70 hover:text-[var(--cardiac-700)]",
                )}
              >
                {t(link.key)}
                {active ? (
                  <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--cardiac-600)]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <a
            href="tel:108"
            title="Emergency medical hotline"
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/80 px-3.5 py-1.5 text-xs font-bold text-red-700 transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100"
          >
            <PhoneCall className="h-3.5 w-3.5 animate-pulse text-red-600" />
            <span>108</span>
          </a>

          {status === "loading" ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-[var(--cardiac-50)]" />
          ) : session?.user ? (
            <div className="flex items-center gap-2.5 border-l border-[var(--cardiac-100)] pl-3">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cardiac-100)] to-[var(--cardiac-200)] text-xs font-bold text-[var(--cardiac-800)]">
                  {(session.user.name ?? session.user.email ?? "U").slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[9rem] truncate text-xs font-medium text-[var(--ink-500)]">
                  {session.user.email}
                </span>
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
              <Button size="sm" asChild>
                <Link href="/register" className="flex items-center gap-1">
                  {t("nav.register")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={t("a11y.toggleNav")}
          aria-expanded={open}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--cardiac-200)] bg-[var(--cardiac-50)]/70 text-[var(--ink-700)] transition-colors hover:bg-[var(--cardiac-100)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X aria-hidden className="h-5 w-5 text-[var(--cardiac-700)]" />
          ) : (
            <Menu aria-hidden className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-[var(--cardiac-100)] bg-white/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav aria-label={t("a11y.mobileNav")} className="space-y-1 px-4 py-4 sm:px-6">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between rounded-md px-4 py-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-[var(--cardiac-50)] text-[var(--cardiac-700)]"
                    : "text-[var(--ink-700)] hover:bg-[var(--cardiac-50)]/60",
                )}
              >
                <span className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-[var(--cardiac-500)]" />
                  {t(link.key)}
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--ink-300)]" />
              </Link>
            );
          })}

          <div className="mt-3 space-y-2 border-t border-[var(--cardiac-100)] pt-4">
            <a
              href="tel:108"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-[var(--cardiac-700)] px-4 py-3 text-sm font-bold text-white"
            >
              <PhoneCall className="h-4 w-4" />
              Emergency Ambulance — Call 108
            </a>

            {session?.user ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full rounded-full border border-[var(--cardiac-200)] px-4 py-3 text-center text-sm font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--cardiac-50)]"
              >
                {t("nav.signOut")}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-[var(--cardiac-200)] px-4 py-3 text-center text-sm font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--cardiac-50)]"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-[var(--cardiac-600)] to-[var(--cardiac-800)] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-[11px] font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Evidence-grounded · Non-diagnostic screening aid
          </div>
        </nav>
      </div>
    </header>
  );
}
