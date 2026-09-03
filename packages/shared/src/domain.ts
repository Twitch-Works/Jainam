/**
 * Domain model shared by the API (@jainam/api) and the mobile app
 * (@jainam/mobile). These are the shapes that cross the wire — the API
 * serialises rows into these, the app consumes them.
 */

export type IconKey =
  | "lotus"
  | "meditate"
  | "chant"
  | "flame"
  | "book"
  | "hand"
  | "standing"
  | "anekant"
  | "aparigraha"
  | "satya"
  | "brahmacharya";

// ── Sadhana ────────────────────────────────────────────────────────────────
export type PracticeKind = "meditation" | "pratikraman" | "chant";

/** A contemplation cue card shown during a timed practice. */
export type SadhanaGuidanceStep = {
  heading: string;
  body: string;
  /** Relative share of the session duration (default 1 = equal split). */
  weight?: number;
};

export type SadhanaPractice = {
  id: string;
  icon: IconKey;
  title: string;
  description: string;
  duration: string;
  /** Drives which guided session runs, and the stats kind logged on finish. */
  sessionKind?: PracticeKind;
  sessionMinutes?: number;
  sessionMantras?: number;
  /** Timed practices: cue cards paced evenly across the duration. */
  guidance?: SadhanaGuidanceStep[];
  /** Japa: the mantra to hold while counting. */
  mantra?: SanskritBlock;
};

export type RecordPracticeResult = {
  ok: true;
  xpAwarded: number;
  leveledUp: boolean;
  level: string;
};

/** Background ambience for the free-form Meditate session. */
export type MeditationSound = {
  id: string;
  title: string;
  description: string;
  /** null = silent option, or audio not sourced yet → silent timer. */
  audioUrl: string | null;
  loop: boolean;
};

// ── Bhajans ────────────────────────────────────────────────────────────────
export type BhajanLyricLine = {
  text: string;
  startMs: number | null;
  endMs: number | null;
};

/** Row for the bhajan list screen — title only, no lyrics or audio. */
export type BhajanSummary = {
  id: string;
  number: number;
  /** Display title — the recorded title, or the tune line when the title is unknown. */
  title: string;
  needsReview: boolean;
};

/** Full bhajan for the detail screen. `audioUrl` is a short-lived signed URL. */
export type BhajanDetail = BhajanSummary & {
  tune: string;
  lyricsLines: BhajanLyricLine[];
  reviewNotes: string | null;
  audioUrl: string | null;
};

// ── Ask Jainam ─────────────────────────────────────────────────────────────
export type ChatRole = "user" | "guru";

export type SanskritBlock = {
  text: string;
  transliteration: string;
  translation: string;
};

/**
 * In-app guided practice a suggestion can deep-link to. `meditate` and
 * `pratikraman` are top-level screens; the rest are `/sadhana/<ref>` slugs.
 */
export const SUGGESTED_PRACTICE_REFS = [
  "samayik",
  "khayotsarga",
  "anupreksha",
  "japa",
  "meditate",
  "pratikraman",
] as const;

export type SuggestedPracticeRef = (typeof SUGGESTED_PRACTICE_REFS)[number];

export type SuggestedPractice = {
  title: string;
  description: string;
  /** Set when the suggestion maps to a guided practice screen in the app. */
  practice?: SuggestedPracticeRef;
  /** Set when the guru suggests a specific bhajan — opens `/bhajans/<number>`. */
  bhajan?: number;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  sanskrit?: SanskritBlock;
  suggestedPractice?: SuggestedPractice;
  createdAt?: string;
};

/** One page of Ask Jainam history, newest message first. */
export type ChatHistoryPage = {
  messages: ChatMessage[];
  /** More (older) messages exist before this page. */
  hasMore: boolean;
  /** `createdAt` of the oldest message here — pass as `before` for the next page. */
  nextCursor: string | null;
};

// ── Wisdom Library ─────────────────────────────────────────────────────────
export type ThoughtOfTheDay = {
  transliteration: string;
  translation: string;
  source: string;
};

export type FeaturedScripture = {
  title: string;
  author: string;
};

export type CoreBeliefKind = "essence" | "practice";

export type CoreBelief = {
  id: string;
  kind: CoreBeliefKind;
  icon: IconKey;
  title: string;
  description: string;
};

export type ContinueReading = {
  title: string;
  chapter: string;
  timeLeft: string;
};

export type LibraryContent = {
  categories: string[];
  featuredScripture: FeaturedScripture;
  coreBeliefs: CoreBelief[];
  corePractices: CoreBelief[];
  continueReading: ContinueReading;
};

// ── Kundli ─────────────────────────────────────────────────────────────────
export type KundliLifeTheme = {
  id: string;
  title: string;
  value: string;
};

export type TodayGuidance = {
  status: "Favorable" | "Neutral" | "Challenging";
  note: string;
  remedy: string;
};

export type KundliData = {
  lifeThemes: KundliLifeTheme[];
  guidance: TodayGuidance;
};

// ── Jain Calendar ──────────────────────────────────────────────────────────
export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  date?: string;
};

// ── Pratikramaṇa ───────────────────────────────────────────────────────────
export type PratikramanPhase =
  | "Preparation"
  | "Sāmāyika"
  | "Chaturviṃśati-stava"
  | "Vandana"
  | "Pratikramaṇa"
  | "Kāyotsarga"
  | "Pratyākhyāna"
  | "Conclusion";

export type PratikramanLength = "brief" | "complete";

export type PratikramanTypeId = "devasi" | "rai" | "pakkhi" | "chaumasi" | "samvatsari";

export type PratikramanType = {
  id: PratikramanTypeId;
  name: string;
  cadence: string;
  blurb: string;
  contentReady: boolean;
};

export type PratikramanStep = {
  id: string;
  phase: PratikramanPhase;
  title: string;
  instruction: string;
  recitation?: string;
};

export type Avashyaka = {
  num: number;
  name: string;
  gloss: string;
};

export type PratikramanProgress = {
  typeSlug: PratikramanTypeId;
  length: PratikramanLength;
  completedSteps: number;
};

export type PratikramanGoal = {
  goal: string;
};

// ── User (Profile + Insights) ──────────────────────────────────────────────
export type UserStats = {
  meditationMinutes: number;
  pratikramanSessions: number;
  ahimsaScore: number;
  longestMeditation: number;
  totalPratikramanSteps: number;
  mantrasChanted: number;
};

export type ConsistencyPoint = {
  day: string;
  value: number; // 0–1
};

export type UserProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  sadhakLevel: string;
  xp: number;
  xpToNext: number;
  vows: string[];
};

/** Composed payload for GET /api/me and the Profile / Insights screens. */
export type Me = {
  profile: UserProfile;
  stats: UserStats;
  consistency: ConsistencyPoint[];
};

/**
 * Per-user app preferences — a small open blob synced to the backend so a
 * choice survives an app restart (and follows the user across devices).
 */
export type UserPreferences = {
  pratikramanType?: PratikramanTypeId;
  pratikramanLength?: PratikramanLength;
  lastTab?: string;
};
