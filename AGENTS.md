# AGENTS.md — ai-cardio

Cardiovascular screening app: Next.js 15 frontend in `web/`, Python ML service in
`ml/`, Prisma (MongoDB) for data.

## Commands (run from `web/`)

- `npm install` — install dependencies
- `npx tsc --noEmit` — typecheck (must be clean)
- `npx eslint .` — lint
- `npx vitest run` — unit tests (10 files / 70 tests)
- `npx next build` — production build
- `npx next dev -p 3000` — dev server

## Frontend conventions

- App Router with route groups: `app/(public)` (landing, login, register),
  `app/(user)` (dashboard, check, hospitals, history, profile, feedback,
  result/[id]), `app/admin` (page, users, documents, hospitals, doctors, ml,
  feedback).
- Styling is Tailwind v4 via `@theme inline` in `app/globals.css`. Use the
  cardiac design tokens — never raw Tailwind palette classes:
  - Cardiac red ramp: `--cardiac-50` … `--cardiac-950` (600 = `#de1145`).
  - Neutrals: `--ink-50` … `--ink-900`.
  - Reference as `bg-[var(--cardiac-600)]`, `text-[var(--ink-700)]`, etc.
  - Do NOT introduce generic "AI" colors (purple/violet/indigo/cyan/fuchsia).
- Custom animation utilities (defined in `globals.css`): `animate-heartbeat`,
  `animate-spin-slow`, `animate-ring-ping`, `animate-pulse-glow`,
  `animate-marquee`, `cardiac-mesh`, `shimmer-bar`, `reveal`,
  `reveal-delay-1..5`.
- Motion helpers live in `components/motion/` (`reveal`, `counter`,
  `ecg-line`); auth layout in `components/auth/`; admin shell helpers in
  `components/admin/` (`admin-page-header`, `admin-table`).
- Images are remote Unsplash URLs (`https://images.unsplash.com/photo-*`).
  They must be allowed in `next.config.ts` `images.remotePatterns` and in the
  CSP `img-src` directive in middleware.
- i18n: all user-facing strings come from `lib/i18n.ts` (`t("namespace.key")`).
  Add new keys there rather than hardcoding copy.
- Bulk import endpoints exist ONLY for doctors and hospitals
  (`/api/admin/doctors/import`, `/api/admin/hospitals/import`) with templates in
  `public/templates/`.
