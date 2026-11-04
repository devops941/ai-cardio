// Auth.js middleware (Section 9.1). Excludes /api, /_next and static files.

import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|templates|.*\\.(?:png|jpg|jpeg|svg|ico|webp|css|js)$).*)",
  ],
};
