# AGENTS.md — Jainam

This file tells any coding agent (Codex, or another AGENTS.md-aware tool)
**how** to build this project. **What** to build — screen specs, copy,
data shapes, phased checklist — lives in `PLAN.md`. Read `PLAN.md` in full
before writing any code; treat it as the product spec and this file as the
engineering constraints on top of it. Claude Code reads the companion
`CLAUDE.md`, which points back to both of these files — all three must stay
in sync. If you change a convention here, update `CLAUDE.md` to match.

**`REVIEW.md`** tracks all placeholder / mock / AI-drafted content awaiting
expert verification (Pratikramaṇa steps, Sanskrit citations, Kundli
remedies, sample user data, the brand mark, etc.). When you add or change
unverified content, add or update its entry there.

---

## 1. Stack (fixed — do not substitute without discussion)

**Monorepo:** pnpm workspaces + **Turborepo**. `pnpm dev` (root) runs the API,
the Expo dev server, and the `@jainam/shared` type-watcher together. See
`README.md` for the full setup flow. Package manager is **pnpm 9** (pinned in
root `package.json` `packageManager`); `.npmrc` sets `node-linker=hoisted` so
Expo/Metro get a flat `node_modules`.

**`apps/mobile` (@jainam/mobile):**
- **Expo SDK 57**, managed workflow (no bare/eject unless explicitly asked).
- **Expo Router** for navigation (file-based routing under `app/`). Do not
  add `@react-navigation/*` directly.
- **@tanstack/react-query** for all server state — one hook per resource in
  `src/hooks/data.ts`, calling the typed `api` client in `src/lib/api.ts`.
  No other state-management library without discussion.
- **@supabase/supabase-js** for auth only (`src/lib/supabase.ts`,
  `src/lib/auth.tsx`). Session token is attached to every API request as a
  Bearer header. Storage adapter chunks into `expo-secure-store` (native) /
  AsyncStorage (web).
- **react-native-svg** for iconography, **expo-linear-gradient** for
  gradients, **@expo-google-fonts/{playfair-display,inter}** via `expo-font`.

**`apps/api` (@jainam/api):**
- **Fastify 5 + TypeScript** (ESM, `moduleResolution: NodeNext` → use
  explicit `.js` in relative imports). Build is `tsc` → `dist/`; dev is
  `tsx watch`. **No bundler** (a Yarn-PnP file in the dev's home dir breaks
  esbuild's workspace resolution).
- `@supabase/supabase-js` **service-role** client for DB access
  (`src/lib/supabase.ts`); the `auth` plugin verifies the Supabase JWT
  locally with `jose` and sets `request.user`. Protected routes use
  `{ preHandler: app.authenticate }`.
- Route modules in `src/routes/*.ts` (one Fastify plugin each), registered
  under `/api` in `src/app.ts`. Request bodies validated with the zod
  schemas from `@jainam/shared`.
- **Ask Jainam** (`src/lib/guru.ts`) runs a provider fallback chain: primary
  `LLM_PROVIDER` (`anthropic` | `openai` | `gemini`, default `anthropic`),
  then on error/timeout every other provider with a key set, then the offline
  keyword engine. All providers share one `SYSTEM_PROMPT` and one
  structured-output contract (`guidanceInputSchema`), so `getGuruReply()` is
  the only seam and routes never learn which model answered. Keys:
  `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` (+ `*_MODEL`
  overrides). If you touch the Anthropic branch, load the `claude-api` skill
  first.
- **Stats writes go through one path**: the `record_practice_session()`
  Postgres function (atomic — updates `user_stats` + `user_consistency` +
  XP/level), called from `POST /api/practice/sessions`. Don't hand-update
  those tables from a route.

**`packages/shared` (@jainam/shared):** domain types + zod schemas, the
single source of truth for wire shapes. Built with `tsc` to `dist/` (both
other packages consume the build). `packages/shared/src/database.types.ts`
is generated (`pnpm db:types`).

**`supabase/`:** `config.toml`, SQL migrations under `migrations/`, and a
programmatic content seed (`apps/api/src/seed/`, run via `pnpm db:seed`).

- No test runner configured yet — don't add one speculatively; if tests
  are requested, ask which runner before adding config.

## 2. Dependency versioning — read before touching `package.json`

Since Expo SDK 56+, every first-party `expo-*` package (expo-constants,
expo-font, expo-linear-gradient, expo-router, etc.) is **unified-versioned**:
its version number tracks the SDK version (e.g. `~57.x` for SDK 57), not an
independent version line like the historical `expo-constants@18.x`. Mixing
an old-style independent version for one `expo-*` package with a
new-style `expo`/`expo-router` version is the single most common cause of
an `ERESOLVE` install failure in this stack.

Rules:
- Always scaffold with `npx create-expo-app@latest` and add packages with
  `npx expo install <package>` (not plain `npm install`) — this resolves
  the correct version automatically.
- If you must hand-edit `package.json`, set every `expo-*` package to the
  same major version as `expo` itself.
- After any dependency change, run `npx expo install --fix` to reconcile
  exact versions, then `npm run typecheck` to confirm nothing broke.

## 3. Directory structure

```
apps/mobile/                Expo app (@jainam/mobile)
  app/                       Expo Router routes (file-based)
    _layout.tsx                Providers (QueryClient + Auth) + auth-gate + Stack
    (auth)/                     sign-in.tsx, sign-up.tsx (email + phone OTP)
    (tabs)/                     index / sadhana / library / insights / profile
    ask-jainam.tsx  pratikraman.tsx  kundli.tsx  calendar.tsx   (pushed)
  src/
    lib/                       supabase.ts, auth.tsx, api.ts, query.ts
    hooks/                     data.ts (all react-query hooks), useAppFonts.ts
    theme/                     colors / typography / spacing — the ONLY design
                                tokens. Never hardcode a hex / font / spacing.
    components/                 Presentational only. `AsyncBoundary` wraps every
                                query-backed screen. `BrandMark` / `Logo` /
                                `iconForKey` (IconKey → brand glyph).
    data/types.ts              Re-exports @jainam/shared (legacy `@/data/types`).
  assets/                      App icons + brand SVGs (see below)
  scripts/build-brand-assets.js   Regenerates assets/images/* from vector art
  metro.config.js             Monorepo watchFolders + nodeModulesPaths

apps/api/                   Fastify API (@jainam/api)
  src/
    server.ts  app.ts  env.ts (zod-validated)
    plugins/auth.ts           Verifies Supabase JWT → request.user; app.authenticate
    lib/supabase.ts           service-role client + per-user RLS client
    lib/guru.ts               Ask-Jainam mock reply engine (REVIEW.md §2)
    routes/*.ts               one Fastify plugin per resource, registered under /api
    seed/                     data.ts + pratikraman-steps.ts + run.ts (pnpm db:seed)
                              bhajans.ts — uploads lyrics + audio to Supabase (pnpm db:bhajans)

packages/shared/            @jainam/shared — domain.ts, schemas.ts, (gen) database.types.ts

supabase/                   config.toml, migrations/*.sql, seed.sql (placeholder)
```

Path alias: `@/*` → `apps/mobile/src/*` (mobile `tsconfig.json`). Import
shared types from `@jainam/shared`.

## 4. Commands (run from repo root)

```bash
pnpm install
pnpm dev                # turbo: API :4000 + Expo + shared watcher
pnpm dev:mobile / pnpm dev:api
pnpm build              # tsc across packages
pnpm typecheck          # turbo → tsc --noEmit per package
pnpm lint               # turbo → eslint per package
pnpm db:start / db:stop / db:reset / db:seed / db:types
pnpm db:migrate        # apply pending supabase/migrations/*.sql
pnpm db:bhajans        # upload bhajan lyrics → public.bhajans + audio → private `bhajans` Storage bucket
```

**Storage:** audio for Bhajans lives in a private Supabase Storage bucket
(`bhajans`); `GET /api/bhajans/:number` mints a short-lived signed URL. No
media is bundled in `apps/mobile`. Source files are repo-root `assets/`.

Per-package: `pnpm --filter @jainam/mobile <script>`. After changing a
mobile dependency, run `pnpm --filter @jainam/mobile exec expo install --fix`.
`pnpm typecheck` and `pnpm lint` must be clean before a phase is done.

## 5. Coding conventions

- **Components:** function components, named exports, one component per
  file, file name matches export name (PascalCase for components, e.g.
  `PracticeListItem.tsx`).
- **Screens:** default export, wrapped in `ScreenContainer`; start with
  `ScreenHeader` (title + subtitle) unless the screen has a bespoke header
  (Home and Ask Jainam do — follow the existing pattern established in
  Phase 4 rather than reinventing it per screen).
- **Styling:** `StyleSheet.create` at the bottom of the file, referencing
  `src/theme` tokens exclusively. No inline style objects with literal
  colors/sizes except one-off dynamic values (e.g. a computed progress
  width) — and even those should reference a token for color.
- **Icons:** extend `src/components/icons.tsx` for new icons, matching the
  existing thin-line gold-stroke style (stroke width ~1.6, `goldDeep`
  default color, 24×24 viewBox unless a brand mark needs more detail).
  Don't introduce a generic icon font as the primary icon system.
- **Types:** no `any`. Wire shapes are exported from `@jainam/shared`
  (`domain.ts`); request payloads have a matching zod schema (`schemas.ts`).
  Never redefine a shape locally that already lives in shared.
- **Data:** every screen's content comes from a react-query hook in
  `apps/mobile/src/hooks/data.ts` that calls the `api` client. No mock
  arrays in components. New endpoint ⇒ add the route in `apps/api`, the
  shape in `@jainam/shared`, and the hook — in that order.
- **API routes:** validate the body with a zod schema; return domain
  shapes from `@jainam/shared`; use `assertNoDbError` for Supabase errors;
  gate user data behind `{ preHandler: app.authenticate }` and filter by
  `request.user.id`.
- **Copy:** use the exact strings from `PLAN.md` §4 where given (titles,
  subtitles, labels, sample data). Don't paraphrase brand copy.
- **Comments:** add a short comment at any integration seam that's
  currently mocked (Ask Jainam's model call, Kundli's chart computation,
  Calendar's data source) explaining what real implementation should
  replace it with — mirror the `TODO (integration)` pattern rather than
  leaving a bare stub.

## 6. Workflow expectations

- Work through `PLAN.md` §6 phases in order. Don't jump ahead to Phase 4
  screens before Phase 1–3 foundations exist — later phases depend on
  earlier ones being correct.
- After each phase, run `typecheck` + `lint` and do a quick visual pass
  (simulator or web) before starting the next phase.
- If a screen spec in `PLAN.md` is ambiguous or a mockup detail is missing,
  make the smallest reasonable assumption, implement it, and leave a
  one-line comment flagging the assumption — don't block on it, but don't
  silently guess on brand-identity-relevant details (colors, copy,
  hierarchy) either.
- Never build anything listed in `PLAN.md` §8 (out of scope) or §6 Phase 6
  (backlog) unless the user explicitly asks for it in a new instruction.
- Keep `PLAN.md`'s checklist boxes up to date as phases complete.

## 7. What "done" looks like

See `PLAN.md` §7 (Definition of Done) for the per-screen bar. At the
project level: `pnpm typecheck`, `pnpm lint`, `pnpm build` are clean across
all packages; the mobile app bundles (`expo export`) and boots on iOS,
Android and web; the API boots and every route is reachable against a local
Supabase (`pnpm db:start && pnpm db:reset && pnpm db:seed`); no design token
is bypassed anywhere in `apps/mobile/app` or `apps/mobile/src/components`.
