# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router app using React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase Auth, and OpenNext.

- `app/` contains routes, layouts, route handlers, and server actions. Role areas are `app/founder/*` and `app/team/*`.
- `components/` contains shared UI. shadcn/ui primitives live in `components/ui/`; role navigation is in `components/founder/` and `components/team/`.
- `lib/` contains domain logic, Supabase clients, auth helpers, reports, notifications, and AI code.
- `hooks/` contains shared hooks.
- `supabase/` contains local Supabase config and auth email templates.
- `docs/` contains schema, JSONB, page, and deployment references.

## Build, Test, and Development Commands

Use pnpm; `pnpm-lock.yaml` is committed.

- `pnpm dev` starts the Next.js dev server with Turbopack.
- `pnpm build` creates a production build.
- `pnpm start` serves the build locally.
- `pnpm lint` runs ESLint with the flat Next config.
- `pnpm typecheck` runs `tsc --noEmit`.
- `pnpm format` runs Prettier on `**/*.{ts,tsx}` and sorts Tailwind classes.
- `pnpm preview` builds with OpenNext and runs a local Worker preview.
- `pnpm deploy` builds and deploys to Workers.
- `pnpm email:sync:dry` previews email sync; `pnpm email:sync` pushes templates.

## Coding Style & Naming Conventions

Write TypeScript and React consistently with nearby files. Use Server Components by default; add `"use client"` only for browser APIs, state, or effects.

Use the `@/*` path alias for repo-root imports. Keep component filenames kebab-case, for example `notification-bell.tsx`, and use PascalCase for exported React components. Prefer named imports from large packages.

Run `pnpm format`, `pnpm lint`, and `pnpm typecheck` before submission.

## Testing Guidelines

There is no test runner configured yet. Validate changes with `pnpm lint`, `pnpm typecheck`, and the relevant local flow in `pnpm dev`. If adding tests, document the command here and colocate tests near the feature.

## Commit & Pull Request Guidelines

Recent commits use Conventional Commit style, for example `feat(founder): ...` and `fix(auth): ...`. Keep subjects imperative, scoped when useful, and under one logical change.

Pull requests should include a short description, validation steps, linked issue or task, and screenshots for UI changes. Mention environment, schema, auth, or deployment impacts.

## Security & Configuration Tips

Copy environment values into `.env.local`. Required variables include `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `GOOGLE_VERTEX_API_KEY`; `NEXT_PUBLIC_SITE_URL` is optional.

Do not commit secrets. `NEXT_PUBLIC_*` variables are public and must be available at build time for Cloudflare Workers. Do not edit generated `.next/` or `.open-next/` output by hand.
