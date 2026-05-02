# Cloudflare Workers deployment

This project deploys to Cloudflare Workers via the OpenNext adapter
(`@opennextjs/cloudflare`). This doc captures the issues we hit during
the initial setup and how to avoid them on similar Next.js + Supabase
projects.

## Final shape

- `@opennextjs/cloudflare` adapter + `wrangler` in devDependencies
- `open-next.config.ts` — Cloudflare preset
- `wrangler.jsonc` — Worker entry, ASSETS / IMAGES / WORKER_SELF_REFERENCE
  bindings, `nodejs_compat` flag
- `middleware.ts` (NOT `proxy.ts`) — see "Pitfall 2"
- Workers Builds dashboard:
  - Build command: `pnpm exec opennextjs-cloudflare build`
  - Deploy command: `npx wrangler deploy`
  - Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
    `NEXT_PUBLIC_SITE_URL`) set as plaintext Variables, available at both
    Build and Runtime

## Pitfalls and fixes

### 1. OpenNext peer-dep range

OpenNext Cloudflare 1.19.x requires
`next ">=15.5.15 <16 || >=16.2.3"`. The 16.0.x – 16.2.2 window is
explicitly unsupported.

**Symptom:** `pnpm add @opennextjs/cloudflare` reports unmet peer dep.

**Fix:** keep Next pinned to a supported version.

**Prevention:** before introducing the adapter, check the current
`@opennextjs/cloudflare` peer range and bump Next if needed.

### 2. Next 16's `proxy.ts` is Node-runtime only

Next 16 renamed `middleware.ts` → `proxy.ts` and made it Node-runtime
exclusive (the `runtime` export is rejected). OpenNext Cloudflare 1.19.x
only supports **edge** middleware.

**Symptom:** build fails with
`Node.js middleware is not currently supported. Consider switching to
Edge Middleware.`

**Fix:** keep the file named `middleware.ts` (still accepted by Next 16,
just deprecated with a warning). Edge runtime is the default for
`middleware.ts`.

**Prevention:** when scaffolding a new Next 16 project that targets
Cloudflare, use the legacy `middleware.ts` filename until OpenNext
ships Node Proxy support.

### 3. Build command must invoke OpenNext, not just `next build`

If the dashboard build command is `pnpm run build` and `package.json`
defines `"build": "next build"`, the OpenNext bundling step is skipped
and `.open-next/` never gets created. The deploy step then fails with
`Could not find compiled Open Next config, did you run the build command?`

**Fix:** in the dashboard, set the build command to:

```
pnpm exec opennextjs-cloudflare build
```

Leave the deploy command as `npx wrangler deploy` — wrangler detects
OpenNext and routes to `opennextjs-cloudflare deploy`.

**Prevention:** keep the local `package.json` `build` script as plain
`next build` (so local dev / typecheck stays fast) and override the
build command in the Cloudflare dashboard. Don't try to make
`pnpm run build` do everything.

### 4. Worker size limit (3 MiB free / 10 MiB paid, compressed)

Our first successful build produced a **19.4 MiB** server worker
(4.32 MiB gzipped) — well over the 3 MiB free-tier limit. Two `import *`
patterns were responsible:

```ts
// components/ui/chart.tsx
import * as RechartsPrimitive from "recharts"   // pulls all of recharts

// components/icon-placeholder.tsx
import * as HugeIcons from "@hugeicons/core-free-icons"  // pulls every icon
```

`import *` defeats tree-shaking. Even though only 3–4 recharts exports
were used, the whole library landed in the bundle. The HugeIcons one
was worse: thousands of icon arrays bundled because the component
resolves icons by string name at runtime.

**Fix:**
1. `chart.tsx` — refactored to named imports
   (`ResponsiveContainer`, `Tooltip`, `Legend`, etc.).
2. `icon-placeholder.tsx` — left as-is (the dynamic-string-resolution
   pattern fundamentally needs the whole package), but its only callers
   are `components/blocks/preview*` which only render on `/design-system`.
   That route now lazy-loads them via `dynamic({ ssr: false })`, so the
   icon registry never enters the server worker.

**Result:** 19.4 MiB → 4.8 MiB raw, 1.22 MiB gzipped — comfortably
under the 3 MiB compressed limit.

**Prevention checklist for any Cloudflare Workers Next.js project:**

- **Never `import *` from large libraries** in code that gets bundled
  into the server worker. Lint rule candidate:
  `no-namespace-import` for known offenders (recharts, icon packs,
  date utilities, charting libs).
- **Audit `dependencies` for build-only tools.** CLIs like `shadcn`
  belong in `devDependencies`. Anything in `dependencies` may end up
  bundled.
- **Watch for icon libraries with by-name resolution.** Patterns like
  `Icons[name]` always require the full pack. Either:
  - replace with explicit per-icon imports at call sites, or
  - generate a static map of only the icons used, or
  - confine the dynamic-resolution component to client-only routes via
    `dynamic({ ssr: false })`.
- **Keep design-system / showcase routes off the server bundle.** If a
  route is a developer reference (renders every component, every
  chart, every icon), wrap its heavy imports in `dynamic({ ssr: false })`
  or remove it from production builds entirely.
- **Measure early.** After the first OpenNext build, check
  `.open-next/server-functions/default/handler.mjs` size. If it's
  above ~5 MiB raw, investigate before pushing.

### 5. Local `wrangler.jsonc` overrides dashboard config on deploy

If you set bindings (Images, Service bindings, vars) in the Cloudflare
dashboard and they're not declared in `wrangler.jsonc`, every deploy
will silently strip them. Wrangler warns but proceeds.

**Symptom:** deploy log shows a config diff and the deployed Worker
loses bindings between deploys.

**Fix:** declare every binding the Worker actually needs in
`wrangler.jsonc`. For env vars specifically, prefer **Workers Builds
env vars** (set under Settings → Variables) over inline `vars` in the
dashboard — Builds vars survive `wrangler.jsonc` overrides; inline
`vars` do not.

**Prevention:** treat `wrangler.jsonc` as the source of truth for
bindings. Only use the dashboard for secrets / build-time env.

### 6. `NEXT_PUBLIC_*` env var placement

`NEXT_PUBLIC_*` vars are inlined into the JS bundle at build time
(both client and server output). For Workers Builds, that means they
must be available **at build time**. Setting them only as runtime
bindings results in `undefined` in the browser.

**Setup:**

| Variable | Build | Runtime | Type |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | required | safe default | Variable |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | required | safe default | Variable |
| `NEXT_PUBLIC_SITE_URL` | required | safe default | Variable |

Plaintext Variable, not Secret — Supabase publishable/anon keys are
public by design (RLS is the security boundary).

Service-role keys, Supabase access tokens, etc. should stay out of
the Worker entirely; they're for local scripts (`scripts/sync-email-templates.mjs`).

### 7. Supabase Auth redirect allow-list

Once deployed, Supabase Auth needs the production URL added to its
allow-list, otherwise email magic links and OAuth callbacks fail.

**Supabase dashboard → Authentication → URL Configuration:**

- **Site URL:** `https://<your-worker>.workers.dev`
  (this is what `{{ .SiteURL }}` resolves to in email templates)
- **Redirect URLs:** add the wildcard pattern
  - `https://<your-worker>.workers.dev/**`
  - `http://localhost:3000/**` (keep for local dev)

## Quick reference: full deploy checklist

When standing up a new Cloudflare Workers deployment of a Next.js +
Supabase project:

1. Confirm Next version is in OpenNext's peer range.
2. Use `middleware.ts` (not `proxy.ts`) for now.
3. Add `@opennextjs/cloudflare` + `wrangler` to devDeps.
4. Add `open-next.config.ts` and `wrangler.jsonc`.
5. Declare ALL needed bindings in `wrangler.jsonc` (assets, images,
   service refs, etc.).
6. Set the dashboard build command to
   `pnpm exec opennextjs-cloudflare build`.
7. Set Workers Builds env vars (build + runtime, plaintext) for
   every `NEXT_PUBLIC_*` value.
8. Audit code for `import *` from large libraries; refactor to named
   imports.
9. Audit `dependencies` for CLI / build-time tools; move to devDeps.
10. Measure `.open-next/server-functions/default/handler.mjs` after
    first build. If > 5 MiB raw, investigate.
11. After first deploy, add the Worker URL to Supabase Auth's
    Site URL and Redirect URL allow-list.
