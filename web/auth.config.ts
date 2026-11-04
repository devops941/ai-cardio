// Edge-safe Auth.js config (Section 9.1). No Prisma/bcrypt imports here.

import type { NextAuthConfig } from "next-auth";

const PROTECTED = [
  "/dashboard",
  "/check",
  "/result",
  "/hospitals",
  "/history",
  "/profile",
  "/feedback",
  "/admin",
];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isProtected = PROTECTED.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      );
      if (!isProtected) return true;

      if (!auth?.user) {
        const url = new URL("/login", request.nextUrl.origin);
        url.searchParams.set("callbackUrl", pathname);
        return Response.redirect(url);
      }

      if (pathname.startsWith("/admin") && auth.user.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", request.nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
