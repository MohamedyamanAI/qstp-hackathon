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

There is no test runner configured. Database types live in `lib/supabase/database.types.ts`; regenerate them via the Supabase MCP `generate_typescript_types` tool (the wired hosted project), not the CLI.

## Architecture

**Next.js 16 App Router + React 19 + Tailwind v4 + Supabase Auth + Vertex AI, deployed to Cloudflare Workers via OpenNext.**

### Role-based workspaces

The app has two authenticated areas, gated by `profiles.role` (`'founder' | 'team'`):

- `app/founder/*` → home `/founder/home`
- `app/team/*` → home `/team/today`

Role plumbing lives in `lib/auth/role.ts` (`fetchUserRole`, `roleHomeFor`, `FOUNDER_HOME`, `TEAM_HOME`). Three places enforce the split and must stay in sync:

1. `lib/supabase/proxy.ts` — middleware redirects authenticated users to their correct home if they hit the wrong area.
2. `app/founder/layout.tsx` and `app/team/layout.tsx` — server components that `redirect()` to `/auth/login` when there are no claims; they also render the role-specific sidebar (`components/founder/founder-sidebar.tsx`, `components/team/team-sidebar.tsx`).
3. `app/auth/actions.ts` — `postAuthRedirect` resolves the role and sends the user to the correct home after login / password update, unless `next` overrides.

When adding a new page under `/founder` or `/team`, the layout already handles auth — don't re-check claims inside the page.

### Auth flow (Supabase SSR)

The app uses three Supabase client factories that must be selected by execution context — mixing them causes session cookies to drift:

- `lib/supabase/client.ts` — `createBrowserClient`, used in client components
- `lib/supabase/server.ts` — `createServerClient` reading from `next/headers`, used in Server Components, Route Handlers, and Server Actions
- `lib/supabase/proxy.ts` — `updateSession`, called **only** from `middleware.ts`. Refreshes the session cookie on every matched request, gates non-public paths, and enforces role-area routing.

Public path prefixes are hardcoded in `lib/supabase/proxy.ts` (`/`, `/auth`, `/api`). Anything else redirects unauthenticated users to `/auth/login?next=<path>`. To add a public route, extend `PUBLIC_PATHS` there.

Auth mutations live in `app/auth/actions.ts` as Server Actions (`login`, `signUp`, `signOut`, `forgotPassword`, `updatePassword`). They build absolute redirect URLs from `NEXT_PUBLIC_SITE_URL` → `x-forwarded-host` → `localhost:3000` (in that order). `app/auth/confirm/route.ts` handles email OTP verification.

The middleware is intentionally named `middleware.ts` (not the Next 16 `proxy.ts`) because OpenNext Cloudflare 1.19.x only supports edge middleware — see `docs/cloudflare-deployment.md` pitfall 2. The matcher excludes Next static assets and common image extensions; keep it in sync if adding new asset types that should bypass session refresh. Per the comment in `proxy.ts`, **do not insert code between `createServerClient` and `supabase.auth.getClaims()`** in the proxy; this has historically caused random logout bugs.

### Intelligence layer (AI)

`lib/intelligence/` is the AI surface. Layers:

- `lib/intelligence/core/agent.ts` — `createAgent` wraps `ToolLoopAgent` from the Vercel AI SDK with the **edge** Vertex provider (`@ai-sdk/google-vertex/edge`). Auth is via `GOOGLE_VERTEX_API_KEY` (Vertex Express mode); the edge variant is mandatory for Cloudflare Workers. Note: Google's provider-defined tools (e.g. `googleSearch`) and custom function tools cannot be mixed.
- `lib/intelligence/core/providers.ts` — supported chat models (`gemini-2.5-flash`, `gemini-2.5-pro`), image models, style presets.
- `lib/intelligence/features/unified-agent/` — role-agnostic assistant. `logic.ts` builds the system prompt; `context.ts` injects context blocks; `context-cache.ts` is an in-memory cache. Re-export surface is `index.ts`.

When adding a new feature agent, put it under `lib/intelligence/features/<name>/` and reuse `createAgent` rather than instantiating providers directly.

### Email templates

`supabase/templates/*.html` is the source of truth for both local Supabase (referenced from `[auth.email.template.*]` in `supabase/config.toml`) and the hosted project (synced via `scripts/sync-email-templates.mjs`, which parses the same TOML). Edit templates here, run `pnpm email:sync:dry` to preview, then `pnpm email:sync` to push.

### UI / design system

- shadcn/ui configured in `components.json` with style `radix-mira`, base color `olive`, icon library `hugeicons`, RTL enabled. Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- Add components with `npx shadcn@latest add <name>` — they land in `components/ui`.
- `lib/design-system.ts` defines the supported style/font/icon presets (the "Mira" preset is the default). The `/design-system` route renders preview blocks for these presets and **must lazy-load heavy preview blocks** via `dynamic({ ssr: false })` to keep the icon/chart packs out of the server worker bundle (see Cloudflare section).
- `components/blocks/preview*` and `components/blocks/dashboards` contain compound preview cards used by the design-system page.
- Theming via `next-themes` (`components/theme-provider.tsx`); global CSS variables live in `app/globals.css`.

### PWA

`app/manifest.ts` generates the web app manifest. `components/sw-register.tsx` registers a service worker on the client (mounted from `app/layout.tsx`). Icons live in `public/icons/`.

### Deployment (Cloudflare Workers via OpenNext)

`open-next.config.ts` + `wrangler.jsonc` drive deployment. Build output goes to `.open-next/` (worker entrypoint `.open-next/worker.js`, static assets bound as `ASSETS`). Compatibility flags `nodejs_compat` and `global_fetch_strictly_public` are set — preserve these when editing `wrangler.jsonc`. Never edit `.open-next/` or `.next/` by hand.

**Worker bundle-size discipline** (3 MiB free / 10 MiB paid, compressed):

- Never `import *` from large libraries (recharts, hugeicons, date utilities) in code that lands in the server worker. Use named imports. `components/ui/chart.tsx` was refactored for this; don't regress.
- Icon-by-string-name patterns (`Icons[name]`) pull the entire pack — confine them to client-only routes via `dynamic({ ssr: false })`. `components/icon-placeholder.tsx` is the existing example.
- CLI / build-time tools belong in `devDependencies`. Anything in `dependencies` may end up bundled.
- After any change touching imports of large libs, sanity-check `.open-next/server-functions/default/handler.mjs` size; > 5 MiB raw warrants investigation.

`docs/cloudflare-deployment.md` is the authoritative postmortem of all the deploy pitfalls — read it before changing build/deploy config.

## Environment

Copy `.env.example` to `.env.local`. Required for the app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GOOGLE_VERTEX_API_KEY` (Vertex AI Express mode; required for the intelligence layer to work)

Optional: `NEXT_PUBLIC_SITE_URL` (used to build absolute auth redirect URLs).

`NEXT_PUBLIC_*` vars are inlined at build time — for Cloudflare Workers Builds they must be set as **Variables** (not Secrets) and available at both build and runtime.

`.mcp.json` wires the Supabase MCP server to the hosted project — use Supabase MCP tools for live DB / migration / edge function operations rather than shelling out to `supabase` CLI.

## Reference docs

- `docs/pages.md` — per-page implementation spec for `/founder/*` and `/team/*` (the source of truth for what each route should contain).
- `docs/schema.sql` — full Postgres schema (enums, tables, RLS).
- `docs/jsonb-schemas.md` — JSONB structures for fields like `metrics`, `generated_outputs`, `extended_profile`, `preferences`.
- `docs/cloudflare-deployment.md` — deploy pitfalls and fixes.

## Conventions

- Path alias `@/*` → repo root (see `tsconfig.json`).
- Prettier config enables `prettier-plugin-tailwindcss`; run `pnpm format` before committing if class order matters.
- React 19 + Next 16 — Server Components are the default; client components must declare `"use client"`. Server Actions are declared with `"use server"` (see `app/auth/actions.ts`).
- Database types come from `lib/supabase/database.types.ts`. Type Supabase clients with `<Database>` so role/enum literals stay narrow (see `lib/auth/role.ts`).
