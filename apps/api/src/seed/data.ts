/**
 * Canonical content for Jainam, authored in TypeScript so it stays typed and
 * reviewable. `pnpm db:seed` (run.ts) writes this into Supabase.
 *
 * Devotional / citation accuracy of much of this is still unverified — see
 * REVIEW.md. Editing here + re-running the seed is the update path.
 */
import { briefPratikraman, completePratikraman } from "./pratikraman-steps.js";

const NO_MANTRA = { mantra_text: null, mantra_transliteration: null, mantra_translation: null };

export const sadhanaPractices = [
  { slug: "samayik", icon: "meditate", title: "Samayik", description: "Be in the present with equanimity", duration: "10 min", featured_on_home: false, session_kind: "meditation", session_minutes: 10, session_mantras: 0, ...NO_MANTRA },
  { slug: "pratikraman", icon: "lotus", title: "Pratikraman", description: "Seek forgiveness and purify", duration: "24 min", featured_on_home: false, session_kind: null, session_minutes: 0, session_mantras: 0, ...NO_MANTRA },
  { slug: "khayotsarga", icon: "meditate", title: "Khayotsarga", description: "Release the body, rest in the soul", duration: "8 min", featured_on_home: false, session_kind: "meditation", session_minutes: 8, session_mantras: 0, ...NO_MANTRA },
  { slug: "anupreksha", icon: "lotus", title: "Anupreksha", description: "Contemplate and reflect deeply", duration: "12 min", featured_on_home: false, session_kind: "meditation", session_minutes: 12, session_mantras: 0, ...NO_MANTRA },
  {
    slug: "japa", icon: "chant", title: "Japa / Chanting", description: "Chant sacred mantras",
    duration: "108 times", featured_on_home: false, session_kind: "chant", session_minutes: 0, session_mantras: 108,
    // Navkār (Namaskāra) Mantra — the universal Jain invocation.
    mantra_text: "णमो अरिहंताणं",
    mantra_transliteration: "Ṇamo Arihantāṇaṁ",
    mantra_translation: "I bow to the Arihants (the enlightened, liberated souls).",
  },
  { slug: "anupreksha-5", icon: "lotus", title: "Anupreksha", description: "Contemplate the nature of the soul.", duration: "5 min", featured_on_home: true, session_kind: "meditation", session_minutes: 5, session_mantras: 0, ...NO_MANTRA },
].map((row, i) => ({ ...row, sort_order: i }));

// Contemplation cue cards for the timed practices, paced evenly across the
// session. ⚠️ AI-drafted, unverified devotional content — see REVIEW.md.
// [slug, weight, heading, body] — weight is the step's relative share of the
// session; cue cards advance automatically as the timer crosses each boundary.
type GuidanceTuple = [string, number, string, string];

export const sadhanaGuidance = (
  [
    // ── Samayik — a guided equanimity sit (10 min) ─────────────────────────
    ["samayik", 2, "Settle in",
      "Sit upright and still — cross-legged on the floor or on a chair, spine easy, hands resting in the lap. Lower or close the eyes. Take three slow breaths; with each out-breath, set down the task, the worry, the hurry you walked in with. For these minutes you have nowhere else to be."],
    ["samayik", 1, "Take the vow — Karemi Bhante",
      "Inwardly take the sāmāyika vow: for this period I withdraw from harmful activity of body, speech and mind — I will not do it, cause it, or approve it. From here, treat this time as sacred and unhurried."],
    ["samayik", 4, "Rest in equanimity — samatā",
      "Let the breath move on its own. Thoughts, sounds and sensations will arise — meet each the same way: notice it, let it be, return to the breath. No chasing the pleasant, no pushing away the unpleasant. This even, unshaken regard for whatever comes is samatā — the heart of sāmāyika."],
    ["samayik", 2, "Friendliness to all beings — maitrī",
      "Silently offer: may all beings be at peace; may I be a friend to every living thing. Bring to mind someone you love, then someone neutral, then someone difficult — and something small: an insect, a bird. Wish each the same freedom from harm."],
    ["samayik", 1, "Conclude and carry it",
      "Gently release the vow. Notice how the mind feels now — a little quieter, a little wider. Bow inwardly. As you rise, carry this steadiness into the very next thing you do."],

    // ── Khāyotsarga — abandonment of the body (8 min) ─────────────────────
    ["khayotsarga", 2, "Become still",
      "Stand with feet slightly apart and arms hanging loose, or sit unmoving. From this moment the body does not move at all — no shifting, no scratching. Let the eyes soften and the face relax."],
    ["khayotsarga", 3, "Release the body, part by part",
      "Move attention slowly from the crown downward: forehead, jaw, shoulders, arms, chest, belly, hips, legs, feet. At each place notice any gripping and let it go. Whatever sensation stays — warmth, ache, tingling — simply allow it. The body is an instrument, not the self."],
    ["khayotsarga", 2, "Rest in the one who knows",
      "Beneath every sensation there is awareness itself — the knower, untouched by comfort or discomfort. Let attention settle there and rest: abandoning the body (kāya-utsarga) without abandoning alertness."],
    ["khayotsarga", 1, "Return",
      "Slowly bring back small movement — fingers, toes, a slightly deeper breath. Open the eyes. Rise without haste, keeping a thread of that stillness with you."],

    // ── Anupreksha — the twelve reflections / bhāvanā (12 min) ────────────
    ["anupreksha", 1, "Anitya — impermanence",
      "All that is gathered will scatter. Possessions, roles, the body itself — every form is passing. Hold nothing as though it will stay."],
    ["anupreksha", 1, "Aśaraṇa — no refuge",
      "Wealth, status and relationships cannot shield the soul from the fruit of its karma. Only right faith, knowledge and conduct are a true refuge."],
    ["anupreksha", 1, "Saṁsāra — the cycle",
      "The soul has wandered countless lives through every state of being — high and low, human and animal. Feel the wish to be free of the wheel."],
    ["anupreksha", 1, "Ekatva — aloneness",
      "The soul acts alone and reaps alone. No one else can carry its karma or walk its path for it."],
    ["anupreksha", 1, "Anyatva — separateness",
      "I am not this body, not these thoughts, not these people around me. The knowing self is distinct from all of it."],
    ["anupreksha", 1, "Aśuci — the body's impurity",
      "The body is sustained by and returns to impurity. Care for it as a vehicle, without mistaking it for the self."],
    ["anupreksha", 1, "Āsrava — inflow of karma",
      "Attachment, aversion and heedlessness draw karma to the soul. Watch honestly where they arose in you today."],
    ["anupreksha", 1, "Saṁvara — stopping the inflow",
      "Restraint, mindfulness and vows close the gates through which karma enters. Resolve to guard one of them today."],
    ["anupreksha", 1, "Nirjarā — shedding karma",
      "Hardship met with patience, and voluntary austerity, wear away karma already bound. Meet difficulty as purification, not punishment."],
    ["anupreksha", 1, "Loka — the universe",
      "Reflect on the vast, ordered cosmos and the soul's small place moving through it, life after life."],
    ["anupreksha", 1, "Bodhidurlabha — rare insight",
      "A human birth, hearing the true teaching, and the will to practise it are rare together. Do not waste this meeting."],
    ["anupreksha", 1, "Dharma — the path",
      "Ahiṁsā, truth and non-attachment are the raft across. Take refuge in the path itself and in those who walk it."],

    // ── Anupreksha (5 min) — contemplation of the soul ───────────────────
    ["anupreksha-5", 2, "The knower",
      "Turn attention inward to the one that is aware of these very words. That bare awareness — not the words, not the thinker — is the soul."],
    ["anupreksha-5", 2, "Untouched",
      "It was never born and will not die. Praise and blame, gain and loss, pass across it like weather across the sky, leaving no mark."],
    ["anupreksha-5", 1, "Rest as that",
      "For the remaining moments, simply be the knowing. Nothing to fix, nothing to become. Rest here."],
  ] satisfies GuidanceTuple[]
).reduce<{ practice_slug: string; step_no: number; weight: number; heading: string; body: string }[]>(
  (acc, [practice_slug, weight, heading, body]) => {
    const step_no = acc.filter((r) => r.practice_slug === practice_slug).length + 1;
    acc.push({ practice_slug, step_no, weight, heading, body });
    return acc;
  },
  [],
);

// Rotated one-per-day by the API. ⚠️ AI-drafted renderings — the Sanskrit
// terms and the *structure* (Das Lakṣaṇa, the twelve bhāvanā, core sūtra
// lines) are authentic; the English wording and attributions need a
// knowledgeable review. See REVIEW.md §5.
export const wisdomThoughts = [
  ["Parasparopagraho Jīvānām", "Souls render service to one another.", "Tattvārtha Sūtra 5.21"],
  ["Samyag-darśana-jñāna-cāritrāṇi mokṣa-mārgaḥ", "Right faith, right knowledge and right conduct together are the path to liberation.", "Tattvārtha Sūtra 1.1"],
  ["Ahiṁsā paramo dharmaḥ", "Non-violence is the highest dharma — in thought, in word, and in deed.", "Jain teaching"],
  ["Anekāntavāda", "Truth has many sides. Hold your view without gripping it, and listen for the rest.", "Jain teaching"],
  ["Aparigraha", "Freedom is needing less, not holding more.", "Jain teaching"],
  ["Micchāmi Dukkaḍaṁ", "May whatever wrong I have done be undone. Ask forgiveness, and give it freely.", "Pratikramaṇa"],

  // Das Lakṣaṇa — the ten supreme virtues.
  ["Uttama Kṣamā", "Supreme forgiveness: release the wrong before it takes root in you.", "Das Lakṣaṇa Dharma"],
  ["Uttama Mārdava", "Supreme humility: bend the ego before it breaks you.", "Das Lakṣaṇa Dharma"],
  ["Uttama Ārjava", "Supreme straightforwardness: let thought, word and deed say the same thing.", "Das Lakṣaṇa Dharma"],
  ["Uttama Śauca", "Supreme purity: the mind grows clear as wanting grows quiet.", "Das Lakṣaṇa Dharma"],
  ["Uttama Satya", "Supreme truth: say what is true and kind and needed — otherwise keep silence.", "Das Lakṣaṇa Dharma"],
  ["Uttama Saṁyama", "Supreme restraint: guard the senses, and spare every living thing.", "Das Lakṣaṇa Dharma"],
  ["Uttama Tapa", "Supreme austerity: choose a little less today, and be lighter for it.", "Das Lakṣaṇa Dharma"],
  ["Uttama Tyāga", "Supreme renunciation: give, and loosen the grip that was holding you.", "Das Lakṣaṇa Dharma"],
  ["Uttama Ākiñcanya", "Supreme non-attachment: use what you own without letting it own you.", "Das Lakṣaṇa Dharma"],
  ["Uttama Brahmacarya", "Supreme self-restraint: turn desire toward the self that does not fade.", "Das Lakṣaṇa Dharma"],

  // The twelve reflections (bhāvanā).
  ["Anitya Bhāvanā", "All that is gathered will scatter. Hold nothing as though it will stay.", "Twelve Reflections"],
  ["Aśaraṇa Bhāvanā", "Wealth and status cannot shield the soul. Right conduct is the only refuge.", "Twelve Reflections"],
  ["Ekatva Bhāvanā", "The soul comes alone and goes alone; its karma is carried by no one else.", "Twelve Reflections"],
  ["Anyatva Bhāvanā", "You are not the body, not the passing thoughts — you are the one who knows them.", "Twelve Reflections"],
  ["Āsrava Bhāvanā", "Attachment, aversion and heedlessness draw karma in. Watch where they arise.", "Twelve Reflections"],
  ["Saṁvara Bhāvanā", "Close one door to careless action today, and less harm flows in.", "Twelve Reflections"],
  ["Nirjarā Bhāvanā", "Hardship met with patience wears old karma away. Meet difficulty as purification.", "Twelve Reflections"],
  ["Bodhidurlabha Bhāvanā", "A human birth, the true teaching, and the will to practise rarely meet. Don't waste it.", "Twelve Reflections"],

  ["Kaṣāya-jaya", "Conquer anger with calm, pride with humility, deceit with honesty, greed with contentment.", "Uttarādhyayana Sūtra"],
  ["Appā so paramappā", "The self, once purified, is itself the Supreme. Seek it within.", "Jain teaching"],
].map(([transliteration, translation, source], i) => ({
  transliteration,
  translation,
  source,
  active: true,
  sort_order: i,
}));

export const libraryCategories = ["All", "Agam", "Tattva", "Stories", "Pravachan", "Life Lessons"].map(
  (name, i) => ({ name, sort_order: i }),
);

// Meditate ambience. audio_url is null until real licensed loops are added —
// see REVIEW.md §9. The app runs a silent timer for a null track.
export const meditationSounds = [
  ["silence", "Silence", "Just the timer and stillness.", null, false],
  ["navkar-chant", "Navkār Mantra", "A soft, slow looping chant of the Namaskāra Mantra.", null, true],
  ["aum", "Aum", "A steady tānpurā-like drone to settle the mind.", null, true],
  ["temple-bells", "Temple Bells", "Distant bells and the hush of a derāsar.", null, true],
  ["flowing-water", "Flowing Water", "A quiet stream over stones.", null, true],
  ["gentle-rain", "Gentle Rain", "Soft, even rainfall.", null, true],
].map(([slug, title, description, audio_url, loop], i) => ({
  slug,
  title,
  description,
  audio_url,
  loop,
  sort_order: i,
}));

export const featuredScriptures = [{ title: "Tattvartha Sutra", author: "by Umaswati", sort_order: 0 }];

export const coreBeliefs = [
  { kind: "essence", slug: "ahimsa", icon: "lotus", title: "Ahimsa", description: "Non-violence in thought, word and action" },
  { kind: "essence", slug: "anekantavada", icon: "anekant", title: "Anekantavada", description: "Multiple perspectives, unlimited truth" },
  { kind: "essence", slug: "aparigraha", icon: "aparigraha", title: "Aparigraha", description: "Non-possessiveness, freedom from greed" },
  { kind: "essence", slug: "satya", icon: "satya", title: "Satya", description: "Truthfulness in all dimensions" },
  { kind: "essence", slug: "brahmacharya", icon: "brahmacharya", title: "Brahmacharya", description: "Self-restraint and purity in conduct" },
  { kind: "practice", slug: "samyak-darshan", icon: "satya", title: "Samyak Darshan", description: "Right Faith" },
  { kind: "practice", slug: "samyak-gyan", icon: "book", title: "Samyak Gyan", description: "Right Knowledge" },
  { kind: "practice", slug: "samyak-charitra", icon: "hand", title: "Samyak Charitra", description: "Right Conduct" },
  { kind: "practice", slug: "tap-sadhana", icon: "flame", title: "Tap & Sadhana", description: "Discipline & Austerity" },
  { kind: "practice", slug: "dhyana", icon: "meditate", title: "Dhyana", description: "Meditation & Inner Awareness" },
].map((row, i) => ({ ...row, sort_order: i }));

export const continueReading = [
  { title: "Uttaradhyayana Sutra", chapter: "Chapter 2", time_left: "12 min left", sort_order: 0 },
];

export const calendarEvents = [
  { title: "Paryushan", description: "8 days of reflection and purification", event_date: null },
  { title: "Mahavir Jayanti", description: "Celebrate the birth of Lord Mahavir", event_date: null },
  { title: "Ayambil Oli", description: "Austerity with devotion and discipline", event_date: null },
  { title: "Das Lakshan", description: "10 virtues. 10 days. Infinite growth.", event_date: null },
].map((row, i) => ({ ...row, sort_order: i }));

export const pratikramanTypes = [
  { slug: "devasi", name: "Devasi", cadence: "Every evening", blurb: "Repentance for the transgressions of the day just passed.", content_ready: true },
  { slug: "rai", name: "Rāi", cadence: "At dawn", blurb: "Repentance for the transgressions of the night.", content_ready: false },
  { slug: "pakkhi", name: "Pakkhī", cadence: "Every fortnight", blurb: "The fortnightly review, adding the Pakkhī Sūtra and 1½-month renunciation.", content_ready: false },
  { slug: "chaumasi", name: "Chaumāsī", cadence: "Every four months", blurb: "The seasonal pratikramaṇa at the close of each cāturmāsa.", content_ready: false },
  { slug: "samvatsari", name: "Sāṃvatsarī", cadence: "Once a year (Paryuṣaṇ)", blurb: "The annual pratikramaṇa — the year's accounting, with the Bārasā Sūtra.", content_ready: false },
].map((row, i) => ({ ...row, sort_order: i }));

export const sixAvashyaka = [
  { num: 1, name: "Sāmāyika", gloss: "Establishing equanimity toward all beings" },
  { num: 2, name: "Chaturviṃśati-stava", gloss: "Praise of the twenty-four Tīrthaṅkaras (Logassa)" },
  { num: 3, name: "Vandana", gloss: "Obeisance to the guru (Khamāsamaṇo, Suguru-vandana)" },
  { num: 4, name: "Pratikramaṇa", gloss: "The confession proper — Vandittu Sūtra and the atichār of the 12 vows" },
  { num: 5, name: "Kāyotsarga", gloss: "Standing meditation, 'abandoning the body', measured in Logassa" },
  { num: 6, name: "Pratyākhyāna", gloss: "Renunciation and vows for the period ahead" },
];

export const pratikramanSteps = [
  ...briefPratikraman.map((s, i) => ({
    length: "brief" as const,
    step_no: i + 1,
    phase: s.phase,
    title: s.title,
    instruction: s.instruction,
    recitation: s.recitation ?? null,
  })),
  ...completePratikraman.map((s, i) => ({
    length: "complete" as const,
    step_no: i + 1,
    phase: s.phase,
    title: s.title,
    instruction: s.instruction,
    recitation: s.recitation ?? null,
  })),
];

// ⚠️ Illustrative only — REVIEW.md §3.
export const kundliLifeThemes = [
  { title: "Spiritual Growth", value: "Strong" },
  { title: "Detachment", value: "Moderate" },
  { title: "Relationships", value: "Learning" },
  { title: "Health", value: "Moderate" },
].map((row, i) => ({ ...row, sort_order: i }));

export const kundliGuidance = [
  {
    status: "Favorable",
    note: "A good day for reflection, study of scripture, and quiet service to others.",
    remedy: "Recite the Navkar Mantra 27 times at sunrise, facing east.",
    sort_order: 0,
  },
];

// Opening "Ask Jainam" exchange shown to a user with no history.
// ⚠️ Sanskrit unverified — REVIEW.md §2.
export const askJainamSeedMessages = [
  {
    role: "user",
    text: "I feel restless and anxious. How can I find peace?",
    sanskrit_text: null,
    sanskrit_transliteration: null,
    sanskrit_translation: null,
    suggested_title: null,
    suggested_description: null,
    suggested_practice: null,
    suggested_bhajan: null,
    sort_order: 0,
  },
  {
    role: "guru",
    text: "Restlessness arises from attachment and expectation. Observe your thoughts without judgment. Bring your attention back to the present moment. Practice samyak dhyan (right meditation).",
    sanskrit_text: "समता सर्वत्र भूयात्",
    sanskrit_transliteration: "Samata sarvatra bhuyat",
    sanskrit_translation: "Let equanimity prevail everywhere.",
    suggested_title: "5 min Anupreksha",
    suggested_description: "Contemplate the nature of the soul.",
    suggested_practice: "anupreksha",
    suggested_bhajan: null,
    sort_order: 1,
  },
];
