# REVIEW.md — content pending verification

Everything in this file is **placeholder, mock, or AI-drafted content that has
not been verified** by a subject-matter expert. None of it is a code bug —
it's the list of things a knowledgeable reviewer (a Jain scholar / practitioner
for the devotional content, a designer for the brand, the product owner for
sample data) needs to check or replace before the app is shown as
authoritative.

Work top-down: items are ordered by how much harm an error would do.

**Legend**

| Mark | Meaning |
|---|---|
| 🔴 | Devotional / scriptural accuracy — wrong content is genuinely harmful |
| 🟠 | Brand / editorial — wrong content looks unprofessional |
| 🟡 | Sample data — obviously fake, just needs real values eventually |
| 🔌 | Integration seam — needs a backend / data source, not a content review |

Each section names the **file(s)** to edit.

> **Path update (2026-09-02, monorepo migration):** the content that used to
> live in `apps/mobile/src/data/*.ts` now lives in **`apps/api/src/seed/data.ts`**
> (+ `pratikraman-steps.ts`) and is written to Postgres by `pnpm db:seed`. The
> Sanskrit reply templates moved to **`apps/api/src/lib/guru.ts`**. Domain
> types are in **`packages/shared/src/domain.ts`**. Where a section below says
> `src/data/...`, read the corresponding seed/shared file. After editing seed
> data, run `pnpm db:seed` to push it.

---

## 1. 🔴 Daily Pratikramaṇa — step sequences & recitations

**Files:** `src/data/pratikraman.ts` · UI in `app/pratikraman.tsx`

Built at user request as a guided player (Śvetāmbar Mūrtipūjak). The whole
data file carries a `⚠️ NEEDS REVIEW` header. Verify against an authoritative
pratikramaṇa pothī:

- [ ] **Step ordering** of `completePratikraman` (48) — the sequence is
  reconstructed from the six-Āvaśyaka framework and the standard vidhi, not
  copied from a source.
- [ ] **The 12 vs 48 split** — `briefPratikraman` is a hand-picked skeleton.
  Confirm these are the right 12, and that "48" is the intended count (the
  number came from the product brief, not a verified source; traditional
  recitation has more discrete sūtras).
- [ ] **`recitation` snippets** — only opening lines are shown, and each is
  tagged "(opening only — verify)". Check the four that appear:
  - `NAVKAR` constant — Namaskāra Mantra (believed correct, still confirm)
  - `KHAMEMI` constant — "Khāmemi savva-jīve…" verse
  - Logassa opening line (steps `c10`, `b05`)
  - Karemi Bhante opening line (steps `c11`, `b06`)
- [ ] **Full sūtra bodies are intentionally omitted.** Decide whether to add
  them (verified transcription, with Devanāgarī + transliteration +
  translation) or link out to a trusted source.
- [ ] **`instruction` wording** for every step — plain-language summaries of
  what each sūtra/action is; check nothing is misdescribed (especially the
  atichār of the 12 vratas, steps `c33`–`c44`).
- [ ] **Other Pratikramaṇa types** — `pratikramanTypes` lists Rāi, Pakkhī,
  Chaumāsī, Sāṃvatsarī with `contentReady: false`. `getPratikramanSteps()`
  currently returns the Devasi sequence for all of them. Each needs its own
  additions (e.g. Pakkhī Sūtra, Sāṃvatsarī Bārasā Sūtra, different
  renunciation lengths).
- [ ] **`sixAvashyaka` glosses** — the one-line descriptions shown on the
  overview screen.

---

## 2. 🔴 Ask Jainam — reply engine & Sanskrit citations

**Files:** `apps/api/src/lib/guru.ts` · `apps/api/src/seed/data.ts`
(`askJainamSeedMessages`) · UI in `apps/mobile/app/ask-jainam.tsx`

### 2a. 🔌 Reply engine — DONE (needs eval)

`getGuruReply()` runs a **provider fallback chain**: it tries the primary
(**`LLM_PROVIDER`**, default `anthropic`), then on any error/timeout
(30 s/provider) falls through to every other provider that has an API key set
(order `anthropic → openai → gemini`), then finally to the offline keyword
engine — so the endpoint always answers. All providers are handed the same
`SYSTEM_PROMPT` (grounds the reply in Jain scripture + guru voice) and the
same structured-output contract — Anthropic via a forced `deliver_guidance`
tool, OpenAI via strict `json_schema` response format, Gemini via
`responseSchema` — and every reply is re-validated against
`guidanceInputSchema` (zod) before it leaves the module. Per-provider model +
key:

| `LLM_PROVIDER` | key | model env (default) |
|---|---|---|
| `anthropic` | `ANTHROPIC_API_KEY` (+ `ANTHROPIC_WORKSPACE_ID` if workspace-linked) | `ANTHROPIC_MODEL` (`claude-opus-5`) |
| `openai` | `OPENAI_API_KEY` (+ optional `OPENAI_BASE_URL` for a gateway) | `OPENAI_MODEL` (`gpt-4o-mini`) |
| `gemini` | `GEMINI_API_KEY` | `GEMINI_MODEL` (`gemini-3.6-flash`) |

The offline keyword engine (`getMockGuruReply`) is the last link in the chain
— reached only when no provider has a key **or** every configured provider
errors. Current state: the Anthropic account 400s on `credit balance is too
low`, so with only `ANTHROPIC_API_KEY` set the chain is anthropic → offline.
Add an `OPENAI_API_KEY` or `GEMINI_API_KEY` and real replies start flowing
without touching `LLM_PROVIDER`.

- [ ] **Evaluate real replies** for doctrinal soundness, tone, and whether the
  model quotes verses accurately — the system prompt asks it to omit a verse
  unless confident, but this needs spot-checking on real traffic before it's
  trusted. Consider a small eval set of seeker questions. Run it against each
  provider you might ship.
- [ ] **Cost / model** — defaults above are conservative-cheap for OpenAI /
  Gemini and house-default (`claude-opus-5`) for Anthropic. Measure quality on
  the eval set before locking a provider/model in.
- [ ] **Rate limiting / abuse** — the endpoint is auth-gated but has no
  per-user quota; add one before public launch.
- [ ] **Suggested-practice deep-link mapping** — the guru reply can tag a
  suggestion with `practice` (`samayik` | `khayotsarga` | `anupreksha` |
  `japa` | `meditate` | `pratikraman`); the app renders those as tappable
  tiles that open the matching screen. Model picks the ref; a keyword
  resolver in `guru.ts` (`PRACTICE_KEYWORDS`) backfills when it's blank.
  Review that the resolver's regexes route sensibly and that the model's
  choices land on the right practice (e.g. a forgiveness suggestion →
  `pratikraman`, not `anupreksha`).

### 2b. Sanskrit / Prākṛt quotations in the offline fallback + seed (AI-drafted, unverified)

Used only when the API is unavailable, plus the opening seed conversation.

| Where | Devanāgarī | Transliteration | Translation given |
|---|---|---|---|
| seed message + `fallback` | समता सर्वत्र भूयात् | Samata sarvatra bhuyat | "Let equanimity prevail everywhere." |
| anger reply | क्षमा वीरस्य भूषणम् | Kshama virasya bhushanam | "Forgiveness is the ornament of the brave." |
| attachment reply | इच्छा हु आगाससमा अणंतिया | Ichha hu agasasama anantiya | "Desire is as endless as the sky." (Uttarādhyayana 9.48 — confirm) |
| fear reply | न हि जीवो न हि मरणं | Na hi jivo na hi maranam | "For the soul, there is neither birth nor death." |
| purpose reply | सम्यग्दर्शनज्ञानचारित्राणि मोक्षमार्गः | Samyak-darshana-jnana-charitrani mokshamargah | "Right faith, knowledge and conduct are the path to liberation." (Tattvārtha Sūtra 1.1) |

- [ ] Confirm each quotation is real, correctly spelled/transliterated/
  translated, and add a source citation.
- [ ] Review the fallback **reply prose** (`templates[].text`, `fallback.text`)
  for doctrinal soundness.

---

## 3. 🔴 / 🔌 Kundli (Jain Jyotiṣ)

**Files:** `app/kundli.tsx` · `src/data/mockUser.ts`

- [ ] 🔌 The North-Indian diamond chart is **static/illustrative** — house
  numbers are placed decoratively, nothing is computed from birth data.
  Needs a chosen Jain-jyotiṣ computation source. (`app/kundli.tsx` has the
  `TODO (integration)` and an on-screen "illustrative chart" disclaimer.)
- [ ] 🔴 `todayGuidance` (`mockUser.ts`) — the status ("Favorable"), the
  note, and especially the **remedy** ("Recite the Navkar Mantra 27 times at
  sunrise, facing east") are invented. Prescribing rituals/remedies should
  be reviewed for appropriateness and accuracy, or sourced.
- [ ] 🟡 `kundliLifeThemes` (Spiritual Growth: Strong, etc.) — sample values.

---

## 4. 🔌 Jain Calendar — dates

**Files:** `src/data/mockUser.ts` (`calendarEvents`) · `app/calendar.tsx`

- [ ] Static seed list of four events (Paryushan, Mahavir Jayanti, Ayambil
  Oli, Das Lakshan) with **no actual dates**. Needs an authoritative
  Tithi-based Jain calendar data feed. `date?` field is defined but unused.
- [ ] Event descriptions are from PLAN.md — confirm wording.

---

## 5. 🔴 / 🟠 Wisdom Library — citations & copy

**Files:** `apps/api/src/seed/data.ts` (`wisdomThoughts`, `featuredScriptures`,
`coreBeliefs`, `corePractices`, `continueReading`, `libraryCategories`) ·
route `apps/api/src/routes/wisdom.ts`

- [ ] 🔴 **`wisdomThoughts`** — the "Thought of the Day" is now a **26-entry
  pool that rotates one-per-day** (UTC epoch-day mod pool size; a row with
  `for_date = today` pins a specific day, e.g. a festival). The entries are
  AI-drafted English renderings of authentic structures — the six core
  lines, the ten Das Lakṣaṇa virtues, eight of the twelve bhāvanā, plus a
  couple of teachings. The Sanskrit terms and framing are sound; the wording
  and the loose attributions ("Jain teaching", "Twelve Reflections",
  "Uttarādhyayana Sūtra") need a knowledgeable pass. Add verified verse
  numbers where a real citation exists. Edit the seed → `pnpm db:seed`.
- [ ] `featuredScripture.author` is the literal string `"by Umaswati"` (the
  "by " is baked into the data). Decide: store `"Umāsvāti"` and render the
  "by" in the component. Also confirm spelling/diacritics (Umāsvāti /
  Umāsvāmī).
- [ ] `coreBeliefs` (Dharmic Essence) — five belief names + one-line
  descriptions, from PLAN.md. Confirm.
- [ ] `corePractices` — named **"Samyak Darshan / Gyan / Charitra"** here;
  PLAN.md §4.5 wrote **"Samayak"**. Pick the correct transliteration. Also
  check the "Tap & Sadhana" and "Dhyana" glosses.
- [ ] `continueReading` — "Uttaradhyayana Sutra" / "Chapter 2" / "12 min
  left" is placeholder demo data (no real reading-progress system yet).
- [ ] `libraryCategories` — All / Agam / Tattva / Stories / Pravachan / Life
  Lessons: the category chips filter nothing yet.

---

## 6. 🔴 / 🟠 Sadhana — practice metadata & guided-session content

**Files:** `apps/api/src/seed/data.ts` (`sadhanaPractices`, `sadhanaGuidance`)
· player UI `apps/mobile/src/components/sadhana/{TimerSession,JapaSession}.tsx`
· route `apps/mobile/app/sadhana/[slug].tsx`

Each practice now opens a real guided session — a timer with contemplation
cue cards (Samayik / Khāyotsarga / Anupreksha), or a japa mala counter
(Chanting). Pratikramaṇa keeps its own step player.

- [ ] 🔴 **`sadhanaGuidance` cue cards** — AI-drafted guided-practice text.
  Samayik is a 5-phase equanimity sit (Settle → Karemi Bhante vow → rest in
  samatā → maitrī → conclude), weighted so the core phase gets ~40% of the
  time; Khāyotsarga a 4-phase body-release; Anupreksha cycles the twelve
  bhāvanās; Anupreksha-5 a 3-phase soul contemplation. The *structure* and
  Sanskrit terms are authentic; the wording needs a knowledgeable review.
  Per-step `weight` in `sadhana_guidance` sets the pacing. Edit
  `apps/api/src/seed/data.ts` → `pnpm db:seed`.
- [ ] 🔴 **Japa mantra** — seeded as the opening line of the Navkār Mantra
  (`णमो अरिहंताणं` / `Ṇamo Arihantāṇaṁ`). Confirm the Prākṛt spelling and
  whether the full five-line mantra should be shown.
- [ ] Practice titles, descriptions, durations (from PLAN.md) — confirm.
- [ ] Spelling: `"Khayotsarga"` vs `"Kāyotsarga"` (see §10).
- [ ] The timer paces cue cards *evenly* across the duration; a
  practitioner-set pace (or explicit per-card timings) may be better.
- [ ] Meditation / chant sessions have no audio, bells, or breath pacing yet.

---

## 7. 🟡 Profile & Insights — user data model

**Files:** `supabase/migrations/*_init.sql` (`profiles`, `user_stats`,
`user_consistency`, `handle_new_user`) · `apps/api/src/routes/me.ts` ·
`apps/mobile/app/(tabs)/{profile,insights}.tsx`

The old `mockUser` ("Mitra Shah", 240 min, 85% …) is **gone**. Real users
now start at zero — the `handle_new_user` signup trigger inserts a `profiles`
row (name from signup metadata / email), a zeroed `user_stats` row, seven
`user_consistency` rows at 0, and a default goal.

**Stats write path — DONE, values need review.** `record_practice_session()`
(in `..._practice_stats.sql`) now updates `user_stats`, `user_consistency`
and XP/level atomically; it fires when a Pratikramaṇa run completes and when
a Sadhana row is tapped ("Log this practice?"). Review the chosen numbers:

- [ ] **Sādhak-level ladder** — the function hard-codes
  `['Shravak','Vratdhārī','Sādhak','Tapasvī','Shraman']` with thresholds
  `[2000, 5000, 12000, 30000, ∞]`. Confirm the names, order, and whether XP
  should reset per level (it currently carries the remainder up). "Shravak"
  as the *starting* level (vs. e.g. "Jigyāsu") is inherited from the initial
  migration's default.
- [ ] **XP award formula** — `max(5, minutes + steps/2 + mantras/27 +
  (pratikraman ? 20 : 0))`. Arbitrary weights; tune once real practice
  durations are known.
- [ ] **"Ahimsa Score"** — now `% of recent days practised` (distinct days
  with a session in the last 7, over `min(7, account-age-days)`), computed in
  `recompute_user_progress()`. A real consistency metric now, but the name
  still implies more than "did you show up" — confirm the concept.
- [ ] **Consistency bars** — rebuilt from `practice_sessions` each session as
  `min(1, sessions_that_day / 3)` (3+ sessions = full bar). The `/ 3`
  divisor and the ignore-of-session-length are arbitrary; revisit whether
  minutes should weight it.
- [ ] **Timezone** — day boundaries use UTC (`created_at at time zone
  'utc'`). A late-evening practice can land on the previous day for users far
  from UTC. Pass the client's tz if this matters.
- [ ] Nothing yet **decrements or expires** stats — `meditation_minutes`,
  XP, etc. only grow. Fine for a "journey" total; note it.
- [ ] **Default `role`** — the trigger sets `"Seeker on the path of
  liberation"`. Confirm, or make it editable at onboarding.
- [ ] **Vows** — `PATCH /api/me` accepts `vows: string[]`, but there's no
  vow-picker UI yet.
- [ ] **Settings rows** in `profile.tsx` (Reminders / Voice & Language /
  Theme / Privacy) are still non-functional display only. The
  `user_preferences` blob (`..._user_preferences.sql`,
  `GET/PUT /api/me/preferences`) is the place to wire real values — it
  already stores the last-chosen Pratikramaṇa type/length.
- [ ] **`continue_reading`** is a single global content row — should become
  per-user reading progress.

---

## 8. 🟠 Brand mark / logo

**Files:** `assets/images/*.png` · `assets/brand/*.svg` · `src/components/BrandMark.tsx` · `src/components/Logo.tsx` · generator `scripts/build-brand-assets.js`

- [ ] The mark (mandala + Ahimsa hand + Dharmachakra) is a **from-scratch
  vector interpretation** of the supplied reference image, not an official
  export. Compare against the real logo: petal counts, hand proportions,
  wheel spoke count, overall weight.
- [ ] Colour: linework uses `goldDeep` `#B8945A` (palette token). The
  reference gold looks slightly warmer — confirm.
- [ ] `favicon.png` crop is tight (hand + wheel only, mandala dropped for
  legibility at 16px) — confirm that's acceptable.
- [ ] If a designer provides an Illustrator/SVG export, replace the PNGs and
  update the paths in `BrandMark.tsx` + `build-brand-assets.js`.
- [ ] App icons only take effect on a native build / `expo prebuild`, not in
  Expo Go.

---

## 9. 🟠 Media assets (imagery + Meditate audio)

**Files:** `apps/mobile/app/(tabs)/index.tsx` (hero) ·
`apps/mobile/app/(tabs)/library.tsx` (scripture card) ·
`apps/api/src/seed/data.ts` (`meditationSounds`)

- [ ] **Imagery** — the Home hero and Library scripture card are gradient +
  icon placeholders. The mockups show stock temple-and-meditation
  photography. Confirm art direction, then source with clear licensing.
- [ ] **Meditate ambience audio** — the `meditation_sounds` catalogue
  (Silence, Navkār Mantra, Aum, Temple Bells, Flowing Water, Gentle Rain)
  is wired end-to-end but every `audio_url` is **null**, so the Meditate
  session currently runs as a silent timer. Add real, licensed looping
  audio (host it and set `audio_url`, or bundle it) — chant/mantra
  recordings especially need a legitimate source. Edit the seed →
  `pnpm db:seed`. An end-of-session bell would also be nice.

---

## 10. 🟠 Transliteration & diacritics — editorial decision needed

The app currently **mixes styles**, e.g.:

- "Pratikraman" (screens, PLAN) vs "Pratikramaṇa" (`pratikraman.ts`)
- "Samayik" / "Samayak" vs "Sāmāyika"
- "Khayotsarga" vs "Kāyotsarga"
- "Anupreksha", "Tirthankara", "Navkar" vs fully-marked forms

- [ ] Decide one house style — full IAST diacritics everywhere, or plain
  ASCII everywhere — and normalise all `src/data/*` and screen copy to it.

---

## 11. 🔌 Integration seams & backend follow-ups

Data now flows app → `apps/api` → Supabase Postgres. Pratikramaṇa
progress / goal, chat history, and practice stats **persist**. Still open:

- [x] ~~Ask Jainam model call~~ — now an Anthropic Messages API call in
  `apps/api/src/lib/guru.ts` (with offline fallback). Needs an eval — §2a.
- [x] ~~Practice → stats~~ — `record_practice_session()` write path; wired to
  Pratikramaṇa completion and Sadhana row taps. Numbers need review — §7.
- [ ] **Kundli** → real Jain-jyotiṣ chart computation from birth data
  (`apps/api/src/routes/kundli.ts` serves seed values).
- [ ] **Jain Calendar** → Tithi-based feed (`apps/api/src/routes/calendar.ts`).
- [ ] **Meditation / chant timer** — sessions are logged from a confirm
  dialog, not an actual guided timer/player.

## 12. 🔐 Auth & security decisions

**Files:** `supabase/config.toml` · `apps/api/src/plugins/auth.ts` ·
`supabase/migrations/*_init.sql` (RLS)

- [ ] **SMS provider** — phone OTP uses fixed local test codes
  (`[auth.sms.test_otp]`). Wire Twilio / MessageBird / etc. for staging &
  production and set the real credentials in the hosted Supabase project.
- [x] **Email confirmation** — dev/test bypass it via `POST /api/dev/sign-up`
  (service role creates a confirmed user); production uses the real
  `supabase.auth.signUp()` and the app shows a "Confirm your email" prompt.
  Keep confirmation ON in the hosted project's Auth settings for production.
  Still to do for production: the confirmation-pending screen is just an
  `Alert` → sign-in; a proper "resend link" / pending-state screen would be
  better.
- [ ] **RLS policies** — content tables are world-readable; user tables are
  `auth.uid() = user_id`. The API uses the **service-role** key (bypasses
  RLS) and filters by `request.user.id` in code — review that every
  user-data query does so.
- [x] **JWT verification** — `apps/api/src/plugins/auth.ts` verifies both the
  legacy HS256 shared secret **and** asymmetric signing keys (ES256/RS256)
  via the project's JWKS endpoint (`.../auth/v1/.well-known/jwks.json`). The
  hosted project uses ES256; `SUPABASE_JWT_SECRET` is now optional.
- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** must only ever be set on the API host,
  never in `apps/mobile` or any `EXPO_PUBLIC_*` var.
- [ ] **Redirect URLs / deep-link scheme** in `config.toml`
  (`site_url = "jainam://"`) — confirm against the production scheme.

## 13. 🔴 / 🟠 Bhajans — lyrics & audio

**Files:** `assets/bhajans.json` · `assets/audio/NN.mp3` (upload source) ·
`apps/api/src/seed/bhajans.ts` · `public.bhajans` table · private `bhajans`
Storage bucket · `app/bhajans.tsx` · `app/bhajans/[number].tsx`

Lyrics are AI/OCR-transcribed from a physical songbook and **not verified**.

- [ ] **Transcription accuracy** — proof every bhajan's `lyricsLines` against
  the source book. `needsReview: true` on numbers **2, 4, 6, 8** (see each
  entry's `reviewNotes` — mostly glare / obscured text in the opening refrain).
- [ ] **Missing titles** — numbers **2 and 7** have `title: null`; the app
  currently shows the first tune line instead. Add the real titles.
- [ ] **Audio ↔ lyrics match** — confirm each `NN.mp3` is the recording of
  bhajan `N` and the take is complete / clean.
- [ ] **Line timings** — `startMs` / `endMs` are all `null`; if karaoke-style
  line highlighting is wanted later, they need to be filled in.
- [ ] **Licensing** — confirm these recordings and lyrics are cleared for
  in-app distribution.
