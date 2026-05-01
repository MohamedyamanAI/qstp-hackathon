# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (lockfile committed). Use `pnpm <script>`.

- `pnpm dev` — Next.js dev server with Turbopack
- `pnpm build` / `pnpm start` — production Next build / serve
- `pnpm lint` — ESLint (flat config, `eslint-config-next`)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` — Prettier on `**/*.{ts,tsx}` (Tailwind class plugin enabled)
- `pnpm preview` — build with OpenNext for Cloudflare and run a local Worker preview
- `pnpm deploy` — build with OpenNext and deploy to Cloudflare Workers
- `pnpm cf-typegen` — regenerate `cloudflare-env.d.ts` from `wrangler.jsonc`
- `pnpm email:sync` / `pnpm email:sync:dry` — push `supabase/templates/*.html` to the hosted Supabase project's auth email templates (requires `SUPABASE_PROJECT_REF` and `SUPABASE_ACCESS_TOKEN` env vars; reads subjects from `supabase/config.toml`)

There is no test runner configured.

## Architecture

**Next.js 16 App Router + React 19 + Tailwind v4 + Supabase Auth, deployed to Cloudflare Workers via OpenNext.**

### Auth flow (Supabase SSR)

The app uses three Supabase client factories that must be selected by execution context — mixing them causes session cookies to drift:

- `lib/supabase/client.ts` — `createBrowserClient`, used in client components
- `lib/supabase/server.ts` — `createServerClient` reading from `next/headers`, used in Server Components, Route Handlers, and Server Actions
- `lib/supabase/proxy.ts` — `updateSession`, called **only** from `middleware.ts`. Refreshes the session cookie on every matched request and gates non-public paths.

Public path prefixes are hardcoded in `lib/supabase/proxy.ts` (`/`, `/auth`, `/api`). Anything else redirects unauthenticated users to `/auth/login?next=<path>`. To add a public route, extend `PUBLIC_PATHS` there.

Auth mutations live in `app/auth/actions.ts` as Server Actions (`login`, `signUp`, `signOut`, `forgotPassword`, `updatePassword`). They build absolute redirect URLs from `NEXT_PUBLIC_SITE_URL` → `x-forwarded-host` → `localhost:3000` (in that order). `app/auth/confirm/route.ts` handles email OTP verification.

The middleware matcher (in `middleware.ts`) excludes Next static assets and common image extensions — keep it in sync if adding new asset types that should bypass session refresh. Per the comment in `proxy.ts`, **do not insert code between `createServerClient` and `supabase.auth.getClaims()`** in the proxy; this has historically caused random logout bugs.

### Email templates

`supabase/templates/*.html` is the source of truth for both local Supabase (referenced from `[auth.email.template.*]` in `supabase/config.toml`) and the hosted project (synced via `scripts/sync-email-templates.mjs`, which parses the same TOML). Edit templates here, run `pnpm email:sync:dry` to preview, then `pnpm email:sync` to push.

### UI / design system

- shadcn/ui configured in `components.json` with style `radix-mira`, base color `olive`, icon library `hugeicons`, RTL enabled. Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- Add components with `npx shadcn@latest add <name>` — they land in `components/ui`.
- `lib/design-system.ts` defines the supported style/font/icon presets (the "Mira" preset is the default). The `/design-system` route renders preview blocks for these presets.
- `components/blocks/preview*` contain compound preview cards used by the design-system page.
- Theming via `next-themes` (`components/theme-provider.tsx`); global CSS variables live in `app/globals.css`.

### PWA

`app/manifest.ts` generates the web app manifest. `components/sw-register.tsx` registers a service worker on the client (mounted from `app/layout.tsx`). Icons live in `public/icons/`.

### Deployment (Cloudflare Workers via OpenNext)

`open-next.config.ts` + `wrangler.jsonc` drive deployment. Build output goes to `.open-next/` (worker entrypoint `.open-next/worker.js`, static assets bound as `ASSETS`). Compatibility flags `nodejs_compat` and `global_fetch_strictly_public` are set — preserve these when editing `wrangler.jsonc`. Never edit `.open-next/` or `.next/` by hand.

## Environment

Copy `.env.example` to `.env.local`. Required for the app: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Optional: `NEXT_PUBLIC_SITE_URL` (used to build absolute auth redirect URLs).

`.mcp.json` wires the Supabase MCP server to the hosted project — use Supabase MCP tools for live DB / migration / edge function operations rather than shelling out to `supabase` CLI.

## Conventions

- Path alias `@/*` → repo root (see `tsconfig.json`).
- Prettier config enables `prettier-plugin-tailwindcss`; run `pnpm format` before committing if class order matters.
- React 19 + Next 16 — Server Components are the default; client components must declare `"use client"`. Server Actions are declared with `"use server"` (see `app/auth/actions.ts`).
