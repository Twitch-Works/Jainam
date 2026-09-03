# PLAN.md — Jainam Build Plan

This is the single source of truth for what to build. `AGENTS.md` and
`CLAUDE.md` cover *how* to build it (stack, conventions, workflow); this
file covers *what* to build, screen by screen, with exact content pulled
from the approved mockups. Do not invent scope beyond what's written here
without flagging it back to the user first — see "Assumptions & open
questions" at the end.

---

## 1. Product overview

- **Name:** Jainam
- **Tagline:** "Live with Ahimsa. Awaken the Soul."
- **Description:** "A holistic spiritual companion to practice, learn and
  live the eternal wisdom of Jainism."
- **Positioning:** Shree Mandir (devotional/ritual tooling) + Headspace
  (guided mindfulness practice), rebuilt specifically for Jain philosophy
  and daily practice.
- **Platform:** Expo (React Native) mobile app, iOS + Android + web via
  react-native-web. Portrait only.
- **Tone:** Pure · Peaceful · Mindful · Minimal. Warm, unhurried, sacred —
  never gamified-loud, never cluttered.

## 2. Design system (exact values — do not approximate)

### 2.1 Color palette

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#F7F2E7` | App background |
| `goldLight` | `#EAD781` | Gradient starts, light accents |
| `gold` | `#D4AF7A` | Primary gold, mid-gradient |
| `goldDeep` | `#B8945A` | Buttons, progress fills, active states, primary icon color |
| `brown` | `#6F5535` | Secondary text, borders (as tint) |
| `ink` | `#2C2C0A` | Primary text, near-black |

Derived/utility tones (build these, don't invent new named colors beyond
this set without updating this table):
- `white` `#FFFFFF`, `surface` `#FFFFFF` (card backgrounds)
- `surfaceMuted` `#FBF8F1` (subtle inset backgrounds, e.g. icon chips)
- `border` `rgba(111,85,53,0.14)`, `borderStrong` `rgba(111,85,53,0.28)`
- `textPrimary` = `ink`, `textSecondary` = `brown`, `textMuted` `#9C8B6F`
- `success` `#6E8B5C` (favorable Kundli status), `warning` `#C08A3E`

### 2.2 Typography

- **Display font:** Playfair Display — elegant, timeless, refined. Used for
  all headings, the wordmark, and screen titles.
- **Body font:** Inter — clean, readable, calm. Used for all body copy,
  labels, buttons, and UI chrome.
- Load both via `@expo-google-fonts/playfair-display` and
  `@expo-google-fonts/inter`, gated behind the splash screen (don't render
  the app until both are loaded).
- Suggested type scale (adjust proportionally, keep the display/body split
  exactly as specified):
  - Display XL 34/40, Display LG 28/34, Display MD 22/28, Display SM 18/24
    (all Playfair, semibold–bold)
  - Body LG 16/23, Body MD 14/20, Body SM 12/17 (Inter regular)
  - Label MD 14/18, Label SM 12/16 (Inter medium)
  - Caption 11/14, letter-spacing 0.4 (Inter medium, uppercase in usage)

### 2.3 Spacing & shape

- Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 48.
- Radius scale: sm 8, md 12, lg 16, xl 24, pill 999.
- Cards: 1px hairline border (`border` token) over heavy shadows. Shadows,
  when used, are soft (low opacity, large blur) — never harsh drop shadows.
- Generous whitespace throughout; gold is an accent color (buttons,
  progress, active states, icons) — it should never fill large background
  areas.

### 2.4 Iconography

- Thin-line icons (~1.6px stroke), gold (`goldDeep` default color),
  matching the logo's line-art style. Build a custom SVG icon set — do not
  substitute a generic icon font as the primary icon language (a generic
  icon font is acceptable only as a rare fallback for one-off utility
  icons with no brand equivalent).
- Required icon set at minimum: Ahimsa hand + Dharmachakra (the brand
  mark), Lotus, Meditate (seated figure), Book, Kundli (diamond/chart
  glyph), Flame, Chant (mala/beads), Insights (bar chart), Profile, Home,
  Calendar, Bell (reminders), chevron-right, send (chat).

### 2.5 Logo usage

The brand lockup (provided as a reference image) has these independent,
reusable pieces — treat them as modular, not a single flattened image:
1. **Mark:** Ahimsa hand with the Dharmachakra (wheel) inside, framed by an
   ornate mandala/lotus border, in gold line art.
2. **Wordmark:** "JAINAM" — Playfair Display, bold, `ink`/`brown` color.
3. **Tagline:** "Live with Ahimsa. Awaken the Soul." — Playfair Display,
   smaller, italic optional.
4. **Description:** the one-line positioning statement (2.1 above) — Inter.
5. **Background:** `cream`.

Use the mark alone for nav bars, tab icons, and app icon. Use the full
lockup (mark + wordmark + tagline) on splash/onboarding only.

---

## 3. Information architecture

**Bottom tab bar (5 tabs):** Home · Sadhana · Library · Insights · Profile

**Pushed/stacked screens (not in the tab bar):**
- Ask Jainam (from Home quick action, or a persistent entry point)
- Daily Pratikraman (from Home quick action, or from Sadhana list)
- Kundli / Jain Jyotish (from Profile "Explore" or its own entry point)
- Jain Calendar (from Profile "Explore" or Home)

Every screen shares the same shell: cream background, safe-area padding,
consistent header pattern (Playfair Display title + Inter subtitle, back
chevron on pushed screens).

---

## 4. Screen-by-screen specification

For each screen: **Purpose**, **Layout (top to bottom)**, **Exact copy**
(use verbatim where given), **Interactions**, **Data needed**.

### 4.1 Home

**Purpose:** Calming entry point; return-to-center moment + fast access to
the day's practice.

**Layout:**
1. Greeting line: "Pranam 🙏"
2. Headline (Display XL): "Return to your center"
3. Subheadline: "A moment of stillness can transform your entire day."
4. Hero visual: full-width rounded (24px) gold-gradient panel with a
   meditating silhouette (placeholder: gradient + centered meditate icon
   until real photography is available — see mockup's temple/lake/sunset
   scene for the target art direction)
5. "Thought of the Day" card:
   - Label: "THOUGHT OF THE DAY" (caption style, gold)
   - Sanskrit transliteration: "Parasparopagraho Jivanam"
   - Translation: "Souls render service to one another."
   - Source: "— Tattvartha Sutra 5.21"
   - **Dynamic (2026-09-03):** `GET /api/wisdom/thought` rotates through a
     ~26-entry pool one-per-day (UTC epoch-day mod pool size); a
     `wisdom_thoughts.for_date` row pins a specific calendar day. Pool text
     is AI-drafted — REVIEW.md §5.
6. Quick actions row (4 circular icon tiles): **Meditate**, **Pratikraman**,
   **Ask Jainam**, **Chant**
7. "Suggested Practice" section header (with "View All" → Sadhana tab) +
   one `PracticeListItem`, e.g. "5 min Anupreksha — Contemplate the nature
   of the soul."

**Interactions:** Meditate/Pratikraman → Daily Pratikraman. Ask Jainam →
Ask Jainam chat. Chant → Sadhana tab. Suggested practice row → Sadhana tab
(or a practice detail/player when built).

**Updated (2026-09-03):** the four tiles now route distinctly — **Meditate →
`/meditate`** (a dedicated free-form session: duration picker + selectable
background ambience, `app/meditate.tsx`), **Pratikraman → `/pratikraman`**,
**Ask Jainam → `/ask-jainam`**, **Chant → `/sadhana/japa`**. Suggested
practice deep-links to `/sadhana/<slug>`.

**Meditate session (`app/meditate.tsx` + `MeditationTimer`):** pick a
duration (5/10/15/20/30 min) and an ambience from `GET /api/meditate/sounds`
(Silence, Navkār Mantra, Aum, Temple Bells, Flowing Water, Gentle Rain) →
countdown ring with the loop playing in the background (`expo-audio`,
`UIBackgroundModes: audio`, screen kept awake), Pause / Resume / End. On
completion logs a `meditation` session (§4.7). **Audio files are not yet
sourced — every track's URL is null, so it currently runs as a silent
timer** (REVIEW.md §9).

### 4.2 Ask Jainam (AI guru chatbot)

**Purpose:** Conversational spiritual guidance grounded in Jain scripture,
in the voice of a wise, warm guru — not a generic assistant.

**Layout:**
1. Header: "Ask Jainam" / "Your inner dialogue, guided by Jain wisdom."
2. Scrollable message list:
   - User messages: right-aligned solid `goldDeep` bubble, cream text.
   - Guru messages: left-aligned card (`surfaceMuted` background) that can
     include an optional Sanskrit block (Devanagari line, transliteration,
     translation, separated by a divider from the guru's plain-language
     reply) and an optional "Suggested Practice" footer (icon + title +
     one-line description). When the suggestion maps to a guided practice
     (`suggestedPractice.practice` = `samayik` | `khayotsarga` | `anupreksha`
     | `japa` | `meditate` | `pratikraman`) the footer is a **tappable tile**
     (gold border, "Begin in the app" + chevron) that deep-links to that
     screen — `/sadhana/<ref>`, or `/meditate` / `/pratikraman`. The model
     picks the ref via structured output; a server-side keyword resolver
     fills it in when the model leaves it blank. `chat_messages` /
     `ask_jainam_seed_messages` carry a nullable `suggested_practice` column
     (migration `20260903050000`).
3. Input row: multiline text input ("Ask anything...") + circular send
   button (gold).

**History paging.** The message list is an **inverted `FlatList`** — opens
pinned to the newest message, no scroll-to-bottom needed. `GET
/api/ask-jainam/messages` is paged newest-first: `?limit=` (default 10) plus
`?before=<cursor>` (a prior page's `nextCursor` = oldest row's `created_at`);
response is `{ messages, hasMore, nextCursor }`. The app uses
`useInfiniteQuery` and calls `fetchNextPage()` on `onEndReached` (scroll-up in
an inverted list) to pull older pages. A brand-new user still gets the seed
exchange as page 1 (`hasMore: false`).

**Seed/example exchange (use as the initial conversation and/or a design
reference for tone):**
> User: "I feel restless and anxious. How can I find peace?"
> Guru — Sanskrit: "समता सर्वत्र भूयात्" — "Samata sarvatra bhuyat" —
> "Let equanimity prevail everywhere." Then: "Restlessness arises from
> attachment and expectation. Observe your thoughts without judgment.
> Bring your attention back to the present moment. Practice samyak dhyan
> (right meditation)." Suggested practice: "5 min Anupreksha — Contemplate
> the nature of the soul."

**AI integration — DONE (2026-09-02; multi-provider fallback chain
2026-09-03).** `apps/api/src/lib/guru.ts` calls a server-side LLM through a
resilient chain: the primary `LLM_PROVIDER` (`anthropic` | `openai` |
`gemini`, default `anthropic`) is tried first, and on any error/timeout
(30 s each) it automatically falls through to every other provider that has an
API key configured, then to the offline keyword engine — so Ask Jainam always
returns an answer. Providers: Anthropic Messages API (`ANTHROPIC_MODEL`,
default `claude-opus-5`), OpenAI Chat Completions (`OPENAI_MODEL`, default
`gpt-4o-mini`, optional `OPENAI_BASE_URL` gateway), Google Gemini
(`GEMINI_MODEL`, default `gemini-3.6-flash`). All share one system prompt
(answers grounded strictly in Jain scripture — Āgam, Tattvārtha Sūtra,
Uttarādhyayana … — in a warm, concise guru voice) and one structured-output
contract, so the reply always keeps the `{ text, sanskrit?, suggestedPractice? }`
shape and `getGuruReply()` stays the only seam. Needs a quality eval —
REVIEW.md §2a.

### 4.3 Daily Pratikraman

**Purpose:** Guided step-by-step Pratikraman ritual with progress tracking
and a user-settable intention/goal to support calm and focus.

**Layout:**
1. Header: "Daily Pratikraman" / "Cleanse. Reflect. Realign."
2. Large circular progress ring (Ahimsa hand icon centered), showing
   `completedSteps / totalSteps`, e.g. "18 / 48" with sublabel
   "Pratikraman Steps". Ring fill uses `goldDeep` over a `border`-colored
   track.
3. "Continue" primary button (gold gradient, pill).
4. Two selectable version cards, side by side: **Brief Version (12 Steps)**
   and **Complete Version (48 Steps)**. Selecting one changes the ring's
   denominator.
5. **"Your Pratikraman Goal"** section (this is a required feature, not
   optional): an editable card where the user sets/edits a personal intention
   for the practice (e.g. "Complete Pratikraman calmly, without rushing,
   every evening."), with a short supporting line explaining why: setting
   intention before starting helps keep the mind calm and steady through
   the ritual. Edit/Save toggle in the section header.

**Interactions:** Continue increments progress. Version toggle recalculates
denominator. Goal is editable inline and persists per user (local state
minimum; real persistence once storage/backend exists).

**Built beyond the original spec (user-requested, 2026-09-01):** the screen
is now a working guided player, not just a counter.
- The user first **chooses a Pratikramaṇa type** — Devasi / Rāi / Pakkhī /
  Chaumāsī / Sāṃvatsarī (Śvetāmbar Mūrtipūjak) — then a **length** (Brief 12
  / Complete 48).
- "Begin" walks step-by-step through the sequence, organised around the
  **six Āvaśyaka** (Sāmāyika, Chaturviṃśati-stava, Vandana, Pratikramaṇa,
  Kāyotsarga, Pratyākhyāna). Each step shows its āvaśyaka, the sūtra/action
  name, an instruction, and (for a few well-known ones) an opening
  recitation line. Next/Back navigate; the ring tracks furthest step
  reached; "Pause" returns to the overview keeping progress.
- Content lives in `src/data/pratikraman.ts`. **It is a scaffold flagged
  `NEEDS REVIEW`** — the exact ordering, the 12/48 split, and every
  recitation snippet must be checked against an authoritative Śvetāmbar
  Mūrtipūjak pothī before this ships as devotional content. Rāi / Pakkhī /
  Chaumāsī / Sāṃvatsarī currently reuse the Devasi walk-through (their
  extra sūtras are a content TODO). Full sūtra bodies are intentionally
  omitted to avoid publishing mis-transcribed scripture.

### 4.4 Sadhana

**Purpose:** Library of daily guided spiritual practices.

**Layout:** Header "Sadhana" / "Your daily spiritual practice", then a
vertical list of practice rows (icon, title, one-line description,
duration, chevron):

| Practice | Description | Duration |
|---|---|---|
| Samayik | Be in the present with equanimity | 10 min |
| Pratikraman | Seek forgiveness and purify | 24 min |
| Khayotsarga | Release the body, rest in the soul | 8 min |
| Anupreksha | Contemplate and reflect deeply | 12 min |
| Japa / Chanting | Chant sacred mantras | 108 times |

**Interactions:** Each row should eventually deep-link to a guided
practice player (timer + instructions + optional audio) — not required for
v1, but the row must be tappable and structured so a player can be slotted
in later without restructuring the list.

**Built (2026-09-03):** every row now opens a real guided session
(`app/sadhana/[slug].tsx`):
- Samayik / Khāyotsarga / Anupreksha → **timed player** — a countdown ring,
  play/pause/end, and contemplation cue cards paced across the duration
  (Anupreksha cycles the twelve bhāvanās). Screen kept awake.
- Japa / Chanting → **mala counter** — tap to count toward 108, with the
  mantra text and haptic feedback; auto-completes at the target.
- Pratikramaṇa keeps its own step player.
On completion each logs a session (§4.7 stats path). Cue-card / mantra text
is AI-drafted and unverified — REVIEW.md §6.

**Planned — voice-driven japa counting (major feature, NOT in scope yet):**
Replace/augment the manual tap in the Japa session with **audio recognition**:
the app listens through the mic and auto-increments the bead count each time
it hears the practitioner say the mantra (e.g. "Ṇamo Arihantāṇaṁ" or the full
Navkār), so the user can do mālā hands-free with eyes closed. Tap-to-count
stays as the fallback / offline mode.

Scope notes for when we build it:
- **On-device only.** Do not stream mic audio to a server — privacy-sensitive
  and must work offline. Candidates: a small on-device keyword-spotting model
  (TensorFlow Lite / ONNX Runtime Mobile / `react-native-executorch`), or a
  simpler energy/onset + template-matching detector tuned to the mantra's
  rhythm. Native module + config plugin (needs a dev client, not Expo Go).
- **Robustness:** count once per repetition (debounce, refractory period),
  tolerate speed/pitch variation and background noise, handle the mantra in
  Prākṛt/Sanskrit and common regional pronunciations; per-user calibration
  ("say the mantra 3× to tune").
- **UX:** clear mic-permission ask and a visible "listening" state; a live
  confidence indicator; manual correction (±) always available; auto-pause on
  silence; battery/thermal-aware; a toggle to fall back to tap mode.
- **Accuracy contract:** decide the acceptable miss/false-count rate and show
  the user they can trust it (or not) — never silently over/undercount a
  devotional practice.
- Same completion path: at the target (108 / chosen count) → log a `chant`
  session (§4.7).

### 4.5 Wisdom Library

**Purpose:** Scripture, teachings, and core-belief reference material.

**Layout:**
1. Header: "Wisdom Library" / "Explore the eternal teachings"
2. Search input: "Search teachings, topics, scriptures..."
3. Horizontal category chips: **All, Agam, Tattva, Stories, Pravachan,
   Life Lessons**
4. Featured scripture card (dark gradient `brown`→`ink`, gold book icon):
   **"Tattvartha Sutra"** by **Umaswati**
5. **"Dharmic Essence"** section — the 5 core beliefs, each with title +
   one-line description:

   | Belief | Description |
   |---|---|
   | Ahimsa | Non-violence in thought, word and action |
   | Anekantavada | Multiple perspectives, unlimited truth |
   | Aparigraha | Non-possessiveness, freedom from greed |
   | Satya | Truthfulness in all dimensions |
   | Brahmacharya | Self-restraint and purity in conduct |

6. **"Continue Reading"** card: **"Uttaradhyayana Sutra"**, "Chapter 2",
   "12 min left"

**Also reference (secondary list, not necessarily its own screen v1):**
**"Core Practices"** — Samayak Darshan (Right Faith), Samayak Gyan (Right
Knowledge), Samayak Charitra (Right Conduct), Tap & Sadhana (Discipline &
Austerity), Dhyana (Meditation & Inner Awareness). Surface these as a
"Core Practices" card set somewhere in the Library (or Home) — they map to
the closing banner motif "Right Faith + Right Knowledge + Right Conduct"
used throughout the mockups.

### 4.6 Kundli (Jain Jyotish)

**Purpose:** Jain-specific astrological insight — not generic Vedic
astrology. Auspicious/inauspicious guidance and remedies through a
Jain lens.

**Layout:**
1. Header: "Kundli (Jain Jyotish)" / "Insights for self-awareness"
2. North-Indian style diamond birth-chart diagram (12 houses laid out in
   the traditional diamond/square-with-diagonals grid, numbered 1–12).
   v1 renders a static/illustrative chart; real chart computation from
   birth data is out of scope until an astrology data source is chosen
   (flag this to the user — see open questions).
3. **"Today's Guidance"** card: a status pill (e.g. "Favorable"), a
   one-line note on what the day is good for, and a **Remedy** sub-section
   with a concrete, simple suggested action (e.g. a specific mantra count
   at a specific time of day). This satisfies the "good/bad days and
   remedies" requirement from the original product brief — do not drop it.
4. **"Life Themes"** — a 2-column grid of theme cards, each with a title
   and a qualitative value:

   | Theme | Value |
   |---|---|
   | Spiritual Growth | Strong |
   | Detachment | Moderate |
   | Relationships | Learning |
   | Health | Moderate |

5. "View Detailed Analysis" primary button (stub screen/deep dive, not yet
   specified in detail — treat as backlog beyond a button that exists).

### 4.7 Insights & Growth

**Purpose:** Reflect the user's self-growth from a Jain practice
perspective — the "progress dashboard."

**Layout:**
1. Header: "Insights" / "Your journey of inner transformation"
2. Three stat cards in a row: **Meditation** (minutes), **Pratikraman**
   (session count), **Ahimsa Score** (percentage) — sample values: 240
   min, 6 sessions, 85%.
3. **"Consistency"** card: a 7-bar chart (Mon–Sun), bar height proportional
   to that day's practice activity.
4. Secondary stats list: **Longest Meditation** (e.g. 20 min), **Total
   Steps of Pratikraman** (e.g. 144), **Mantras Chanted** (e.g. 2,160).

### 4.8 Profile

**Purpose:** Identity, spiritual progress level, vows, and settings.

**Layout:**
1. Avatar (circular, profile icon placeholder) + name (e.g. "Mitra Shah")
   + role line ("Seeker on the path of liberation")
2. **Sadhak Level** card: level name (e.g. "Shravak"), XP progress bar
   (e.g. 1,250 / 2,000)
3. **"My Vows"** — chips for the user's chosen vows (e.g. Ahimsa, Satya,
   Aparigraha)
4. **"Explore"** section — links out to Jain Calendar, Reminders, etc.
5. **Settings** list: Reminders (on/off), Voice & Language (e.g. Hindi),
   Theme (Light — the app is light-only per the brand; do not build a dark
   mode unless separately requested), Privacy (Manage).

### 4.9 Jain Calendar

**Purpose:** Keep users aligned with Jain religious dates.

**Layout:** Header "Jain Calendar" + a list of event cards (icon, title,
one-line description). Seed content:

| Event | Description |
|---|---|
| Paryushan | 8 days of reflection and purification |
| Mahavir Jayanti | Celebrate the birth of Lord Mahavir |
| Ayambil Oli | Austerity with devotion and discipline |
| Das Lakshan | 10 virtues. 10 days. Infinite growth. |

A real Jain-calendar (Tithi-based) data source is required for a shipping
version — v1 ships with this static seed list plus a clearly visible "View
Full Calendar" affordance.

---

### 4.10 Bhajans (added 2026-09-03)

**Purpose:** Devotional songs the user can read along with and play as an
audio meditation.

**Screens:**
- **Home** — a "Bhajans" section (`SectionHeader` + a pressable card) →
  `/bhajans`.
- **`/bhajans`** (`app/bhajans.tsx`) — a list of **titles only** (number
  chip + title + chevron). Tapping a row → `/bhajans/[number]`.
- **`/bhajans/[number]`** (`app/bhajans/[number].tsx`) — the bhajan: display
  title, tune line, a **play/pause control** with a progress bar + elapsed /
  total time (`expo-audio` `useAudioPlayer` + `useAudioPlayerStatus`,
  `shouldPlayInBackground`, `useKeepAwake`), then the full lyrics. Audio
  pauses on unmount.

**Storage & API — content never ships in the app bundle.** Lyrics +
metadata live in `public.bhajans` (migration `20260903060000`); the MP3s
live in the **private `bhajans` Storage bucket**. `pnpm db:bhajans`
(`apps/api/src/seed/bhajans.ts`) reads repo-root `assets/bhajans.json` +
`assets/audio/NN.mp3`, creates the bucket, uploads the audio, and upserts
the rows.
- `GET /api/bhajans` → `{ bhajans: BhajanSummary[] }` (id, number, title,
  needsReview). Title falls back to the `tune` line when the real title is
  unknown.
- `GET /api/bhajans/:number` → `BhajanDetail` — full lyrics + a **6-hour
  signed URL** for the audio (minted server-side from the private bucket),
  or `audioUrl: null` if no file. The app re-fetches on screen open so the
  URL is always fresh.

Content is AI/OCR-transcribed and flagged in REVIEW.md §13.

---

## 5. Data models (types to implement, minimum shape)

> **Implemented (2026-09-02).** These now live in `packages/shared/src/domain.ts`
> as the wire contract between `apps/api` and `apps/mobile`, with matching
> Postgres tables (`supabase/migrations`) and zod request schemas
> (`packages/shared/src/schemas.ts`). The shapes below are the original spec;
> the code is the source of truth.

```ts
type SadhanaPractice = { id: string; icon: IconKey; title: string; description: string; duration: string };

type ChatMessage = {
  id: string;
  role: "user" | "guru";
  text: string;
  sanskrit?: { text: string; transliteration: string; translation: string };
  suggestedPractice?: { title: string; description: string };
};

type KundliLifeTheme = { id: string; title: string; value: string };
type TodayGuidance = { status: "Favorable" | "Neutral" | "Challenging"; note: string; remedy: string };
type CalendarEvent = { id: string; title: string; description: string; date?: string };

type UserProfile = {
  name: string; role: string; sadhakLevel: string; xp: number; xpToNext: number;
  vows: string[];
  stats: { meditationMinutes: number; pratikramanSessions: number; ahimsaScore: number;
            longestMeditation: number; totalPratikramanSteps: number; mantrasChanted: number };
  consistency: { day: string; value: number }[]; // value 0–1
};
```

## 6. Build phases

Work in this order; each phase should be independently runnable/verifiable
before moving to the next. Update this checklist in place as work
completes (check boxes, don't delete the plan).

- [x] **Phase 0 — Scaffold:** Expo + TypeScript + Expo Router project boots
      to a blank screen with the correct package versions (see AGENTS.md
      "Dependency versioning" — this is the #1 place prior attempts broke).
- [x] **Phase 1 — Design system:** `src/theme/` (colors, typography,
      spacing) + font loading + the custom icon set (§2.4) implemented and
      visually sanity-checked (a throwaway screen rendering the full
      palette/type scale/icon set is fine for this phase, then delete it).
- [x] **Phase 2 — Component library:** `ScreenContainer`, `ScreenHeader`,
      `Card`, `SectionHeader`, `PrimaryButton`, `IconTile`, `ProgressRing`,
      `PracticeListItem`, `StatCard`, `Chip` — built and usable in
      isolation before wiring into real screens.
- [x] **Phase 3 — Navigation shell:** Root stack + 5-tab bottom nav wired
      up with empty/placeholder screens at every route in §3.
- [x] **Phase 4 — Screens:** Implement §4.1–§4.9 in order, each screen
      matching its spec's copy and layout exactly, backed by typed mock
      data in `src/data/`.
- [x] **Phase 5 — Polish pass:** Consistent spacing/typography audit
      against §2, empty/loading states, safe-area correctness on both
      platforms, `npm run typecheck` and `npm run lint` clean.
- [x] **Phase 5.5 — Backend & monorepo (user-requested, 2026-09-02):**
      Repo is now a pnpm + Turborepo monorepo — `apps/mobile` (Expo),
      `apps/api` (Fastify + TypeScript), `packages/shared` (types + zod),
      `supabase/` (Postgres schema + programmatic content seed). Email +
      phone-OTP auth via Supabase Auth (app-side), JWT verified at the API.
      Every screen now reads from the API via react-query hooks; all
      `src/data/*` mock modules were migrated to tables + REST endpoints +
      hooks. New users start at zero (a signup trigger bootstraps their
      rows). Setup flow: `README.md`.
- [x] **Phase 5.6 — Ask Jainam AI + stats (user-requested, 2026-09-02):**
      `apps/api/src/lib/guru.ts` now calls the Anthropic Messages API
      (`claude-opus-5`, forced-tool structured output, Jain-scripture system
      prompt) with the keyword engine as an offline fallback — §4.2.
      A `record_practice_session()` DB function + `POST /api/practice/sessions`
      form the stats write path: completing a Pratikramaṇa run, or tapping a
      Sadhana practice row, now increments `user_stats` / `user_consistency`
      and awards XP / advances the sādhak level. Chosen numbers (XP formula,
      level ladder, Ahimsa Score = consistency avg) are placeholders — see
      REVIEW.md §7.
- [ ] **Phase 6 — Backlog (do not build unless separately requested):**
      **Voice-driven japa counting** (on-device audio recognition auto-counts
      mantra repetitions in the Japa session — full spec in §4.4),
      Lockscreen Shloka widget, Community, Mitra Shah (friend-finding),
      Journal, Kids Corner, Audio Pravachan, multi-language voice input,
      real Kundli computation, real Jain-calendar data feed, guided-practice
      audio (bells / narration) for the timed sessions.

## 7. Definition of done (per screen)

A screen is done when: it matches its §4 spec's copy and layout, uses only
tokens from §2 (no hardcoded hex/font values), is fully typed, has no
console warnings, renders correctly on iOS + Android + web, and its data
is imported from `src/data/` rather than inlined in the component.

## 8. Explicitly out of scope for v1

- ~~Real backend / authentication / data persistence.~~ **Now built** — see
  Phase 5.5 and `README.md`. (Still mock: the Ask Jainam model call, and
  Kundli / Calendar content values.)
- Real Jain astrological chart computation.
- Native lockscreen/widget code (requires a dev client, not plain Expo Go).
- Community/social features, Kids Corner, Journal.
- Dark mode.

## 9. Assumptions & open questions

> See **`REVIEW.md`** for the full running list of placeholder / mock /
> AI-drafted content awaiting expert verification. The items below are the
> higher-level product decisions.

Flag these back to the user rather than silently deciding:
1. ~~Real logo asset files (app icon, splash, adaptive icon).~~ **Resolved:**
   the brand mark (mandala + Ahimsa hand + Dharmachakra) is now drawn as
   vector art — `scripts/build-brand-assets.js` generates the icon / adaptive
   icon (+ monochrome) / splash / favicon PNGs under `assets/images/`, and
   `src/components/BrandMark.tsx` + `Logo.tsx` are the in-app equivalents.
   Swap in a hand-tuned illustrator export later if desired; regenerate with
   `node scripts/build-brand-assets.js` (needs `rsvg-convert`).
2. Real photography for the Home hero and Wisdom Library scripture cards —
   mockups show AI-generated/stock temple-and-meditation scenes; confirm
   sourcing/licensing before using real images.
3. Kundli: what astrological system/data source computes the actual
   chart? This is currently illustrative only.
4. Jain Calendar: what's the authoritative source for Tithi-based dates?
5. Ask Jainam: confirm the model/backend to integrate (Anthropic API
   directly from a backend proxy is the default assumption) and the exact
   system-prompt/content boundaries desired.
