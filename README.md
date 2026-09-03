# Jainam — monorepo

A holistic Jain spiritual-practice app. pnpm workspaces + Turborepo.

```
apps/
  mobile/    Expo (React Native) app — Expo Router, @jainam/mobile
  api/       Fastify + TypeScript REST API — @jainam/api
packages/
  shared/    Domain types + zod schemas shared by app and API — @jainam/shared
supabase/    Local Supabase stack: config, migrations, programmatic seed
```

- **Auth:** the app talks to **Supabase Auth** directly (email + password, or
  phone OTP). Supabase issues the JWT; the API verifies it on every route and
  owns all application data.
- **Data:** every screen reads from the API (`apps/api`), which reads Postgres
  (Supabase). No mock data in the app anymore.

## Prerequisites

- Node ≥ 20, **pnpm 9** (`corepack enable`)
- **Docker** (for the local Supabase stack)

## First-time setup

```bash
pnpm install

# 1. Env. Two files:
cp .env.example .env                            # API + server-side (repo root)
cp apps/mobile/.env.example apps/mobile/.env    # EXPO_PUBLIC_* only
#   Local stack:  pnpm db:start  (prints the values)  → fill both files
#   Hosted:       Supabase dashboard → Project Settings → API / Database
#                 (see comments in .env.example). `.env` also needs
#                 SUPABASE_DB_URL for the migration step below.

# 2. Apply schema + seed content.
pnpm db:migrate        # psql applies supabase/migrations/*.sql (needs SUPABASE_DB_URL)
pnpm db:seed           # upserts the content tables from apps/api/src/seed
#   Local-only alternative: `pnpm db:reset` (drops data, re-runs migrations + seed.sql)

# 3. Run everything.
pnpm dev               # turbo: API on :4000, Expo dev server, shared in watch
```

No `SUPABASE_DB_URL`? Paste `supabase/schema.sql` into the Supabase SQL
Editor instead, then run `pnpm db:seed`.

`pnpm dev` uses Turborepo's **interactive terminal UI** (`ui: "tui"` in
`turbo.json`): a task list on the left (`@jainam/mobile#dev`,
`@jainam/api#dev`, `@jainam/shared#dev`), logs on the right.

- **↑/↓** select a task
- **`i`** interact with the selected task — then, on `@jainam/mobile#dev`,
  type Expo's keys (`i` iOS · `a` Android · `w` web · `r` reload · `?` menu).
  Press **Ctrl-Z** to stop interacting.
- **`m`** more keybindings

Prefer separate terminals? `pnpm dev:api` and `pnpm dev:mobile` run one
side each.

## Scripts (root)

| Command | What |
|---|---|
| `pnpm dev` | All packages in dev (turbo) |
| `pnpm build` | Build every package |
| `pnpm typecheck` / `pnpm lint` | Across the workspace |
| `pnpm db:start` / `db:stop` | Local Supabase stack (Docker) |
| `pnpm db:migrate` | Apply *pending* `supabase/migrations/*.sql` to `SUPABASE_DB_URL` (tracked in `public.schema_migrations`; safe to re-run) |
| `pnpm db:reset` | Local only — drop data, re-run migrations + `seed.sql` |
| `pnpm db:seed` | Upsert content tables from `apps/api/src/seed` (uses the service-role key) |
| `pnpm db:bhajans` | Upload bhajan lyrics → `public.bhajans` and audio → the private `bhajans` Storage bucket, from repo-root `assets/bhajans.json` + `assets/audio/NN.mp3` |
| `pnpm db:types` | Regenerate `packages/shared/src/database.types.ts` from the DB |

## Environments

`APP_ENV` (`.env`) and `EXPO_PUBLIC_APP_ENV` (`apps/mobile/.env`) —
`development` | `test` | `production`, **default `development`**. Keep the
two in sync.

- **development / test** — the API mounts `/api/dev/*`, and the sign-up
  screen creates an **already-confirmed** user through it (no email link,
  no email rate limits), then signs in immediately.
- **production** — `/api/dev/*` is not registered; sign-up uses the real
  `supabase.auth.signUp()`. If the Supabase project requires email
  confirmation, the app shows a "Confirm your email" prompt and returns to
  sign-in.

`GET /health` reports the active env.

## Deploying the API to Vercel

Only `apps/api` is deployed — the Expo app is shipped separately. Config
lives in `vercel.json` + `api/index.ts` (a thin serverless wrapper around
`buildApp()`) + `public/` (a placeholder landing page).

1. **Import the repo** into Vercel. Leave **Root Directory = repo root**
   (the function needs the pnpm workspace). `vercel.json` sets the build
   (`pnpm --filter=@jainam/api... run build`) and rewrites every path to the
   function.
2. **Set env vars** (Project → Settings → Environment Variables). Required —
   the function exits on boot if any are missing:
   `APP_ENV=production`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, plus `LLM_PROVIDER` and its key
   (`OPENAI_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` + `*_MODEL`).
   Do **not** set `SUPABASE_DB_URL` (local-only, for `db:migrate`).
3. **Region** — `vercel.json` pins `bom1`; change it to match your Supabase
   project's region.
4. **Deploy**, then point the app at it: set
   `EXPO_PUBLIC_API_URL=https://<project>.vercel.app` in `apps/mobile/.env`
   and rebuild.

Migrations and seeds still run from a workstation against the hosted DB
(`pnpm db:migrate` / `db:seed` / `db:bhajans`) — Vercel only runs the API.
Note: `getGuruReply`'s provider fallbacks use a 30 s timeout each, so a fully
failing chain can exceed the 60 s function limit — configure only the
provider(s) you use.

## Auth notes

- Local phone OTP uses fixed test codes (see `supabase/config.toml` →
  `[auth.sms.test_otp]`): e.g. `+15555550100` → `123456`. Wire a real SMS
  provider (Twilio, etc.) for staging/production.
- Email confirmation: off for the local stack (`config.toml`), and bypassed
  in dev/test via `/api/dev/sign-up` even against a hosted project that has
  it on. For production, leave it on in the Supabase dashboard.
- A Postgres trigger (`handle_new_user`) creates the `profiles` / `user_stats`
  / `user_consistency` / goal rows on signup — new users start at zero.
- The API verifies access tokens against the project JWKS (ES256/RS256) and
  the legacy HS256 secret.

## Turbo env passthrough

`turbo.json` `globalEnv` lists every variable that reaches the tasks. Expo
reads `apps/mobile/.env` itself (only `EXPO_PUBLIC_*`); the API reads the
repo-root `.env`.
