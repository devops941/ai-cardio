import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { t } from "@/lib/i18n";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${t("appName")} — ${t("tagline")}`,
    template: `%s · ${t("appName")}`,
  },
  description: t("tagline"),
  applicationName: t("appName"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#de1145",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--background)] text-[var(--ink-900)] antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen w-full flex-col">
            {/* Ambient cardiac glow backdrop */}
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
              <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--cardiac-200)]/30 blur-[120px]" />
              <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-[var(--cardiac-300)]/20 blur-[130px]" />
            </div>

            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
