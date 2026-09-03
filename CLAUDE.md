# CLAUDE.md — Jainam

This file is read automatically by Claude Code when working in this repo.
Two other files carry the actual content — read both in full before
writing any code:

- **`PLAN.md`** — the product spec: design system, information
  architecture, screen-by-screen layout and exact copy, data models, and
  the phased build checklist. This is the source of truth for *what* to
  build.
- **`AGENTS.md`** — the engineering constraints: stack, directory
  structure, dependency-versioning rules, coding conventions, and workflow
  expectations. This is the source of truth for *how* to build it. It's
  also what Codex and other AGENTS.md-aware tools read, so if you ever
  update conventions, update `AGENTS.md` (not a Claude-only copy of it) so
  the two tools stay in sync.

- **`REVIEW.md`** — every piece of placeholder / mock / AI-drafted content
  that still needs expert verification (Pratikramaṇa steps, Sanskrit
  citations, Kundli remedies, sample user data, brand mark, …). Add or
  update an entry whenever you introduce or change unverified content.
- **`README.md`** — the monorepo layout and the local setup flow
  (`pnpm install` → `pnpm db:start` → env → `pnpm db:reset` → `pnpm db:seed`
  → `pnpm dev`).

This is a **pnpm + Turborepo monorepo**: `apps/mobile` (Expo),
`apps/api` (Fastify), `packages/shared` (types + zod), `supabase/`
(Postgres schema + seed). All commands run from the repo root with `pnpm`.
This file only adds Claude-Code-specific process notes on top of the above.

## How to work this repo

1. **Read `PLAN.md` and `AGENTS.md` fully before touching any file**,
   including on a fresh session — don't rely on memory of a prior session's
   summary of them.
2. **Build in phase order** per `PLAN.md` §6. Don't skip ahead to a later
   phase because it seems more interesting or the user's latest message
   references it — finish or explicitly pause the current phase first, and
   say which phase you're on when you report progress.
3. **Update the `PLAN.md` checklist in place** (`- [ ]` → `- [x]`) as
   phases complete, in the same commit/turn as the work, so the plan stays
   an accurate live document rather than drifting from reality.
4. **Run `pnpm typecheck` and `pnpm lint` (from the repo root) after each
   phase**, before reporting it as done — they run across every workspace
   package. Fix failures before moving on. For backend work also run
   `pnpm build` (the API is `tsc`-built) and, when a local Supabase is up,
   smoke-test the affected routes.
5. **Scaffolding is done.** The monorepo, backend, auth and full data
   migration exist (see `AGENTS.md` §1–§4 and `README.md`). New data ⇒
   route in `apps/api` + shape in `@jainam/shared` + hook in
   `apps/mobile/src/hooks/data.ts`, in that order.
6. **Don't invent scope.** Anything in `PLAN.md` §8 (out of scope) or the
   Phase 6 backlog stays untouched unless the user asks for it directly in
   a new message — a mockup detail or an adjacent nice-to-have is not
   sufficient justification to build ahead of spec.
7. **Flag ambiguity, don't silently resolve brand-identity questions.**
   `PLAN.md` §9 lists known open questions (real photography, Kundli data
   source, calendar data source, Ask Jainam backend; the logo assets are now
   generated vector art — see §9 item 1). If you
   hit one of these, use the smallest reasonable placeholder, mark it
   clearly (comment + a note back to the user), and keep moving — don't
   block, but don't guess silently on things like color, copy, or
   hierarchy either.
8. **Design-system fidelity is a hard requirement, not a suggestion.**
   Every color, font, and spacing value must trace back to
   `apps/mobile/src/theme/`. If you catch yourself typing a hex code or a
   raw font size into a screen file, stop and add/reuse a token instead.

## Reporting progress

When you finish a phase or a meaningful chunk of work, summarize: which
`PLAN.md` phase/section you completed, what deviated from spec (if
anything) and why, and what's next. Don't just say "done" — the user is
tracking this against `PLAN.md`, so your summary should map onto it.
