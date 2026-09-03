import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import OpenAI from "openai";
import { z } from "zod";
import {
  SUGGESTED_PRACTICE_REFS,
  type ChatMessage,
  type SanskritBlock,
  type SuggestedPractice,
  type SuggestedPracticeRef,
} from "@jainam/shared";
import { env } from "../env.js";

export type GuruReply = {
  text: string;
  sanskrit?: SanskritBlock;
  suggestedPractice?: SuggestedPractice;
};

// ── Shared prompt + output contract ──────────────────────────────────────
//
// The provider is chosen by LLM_PROVIDER (anthropic | openai | gemini). Every
// provider is asked for the SAME structured shape and validated against
// `guidanceInputSchema` before it leaves this module, so `getGuruReply()`
// stays a stable seam and the routes never learn which model answered.

const SYSTEM_PROMPT = `You are Jainam, a warm and concise spiritual guide speaking in the voice of a wise, kind Jain guru.

Rules:
- Ground every answer strictly in Jain scripture and philosophy — the Āgamas, Tattvārtha Sūtra, Uttarādhyayana Sūtra, Ācārāṅga, and the teachings of the Tīrthaṅkaras. Do not draw on other religions or secular self-help.
- Voice: unhurried, compassionate, direct. 2–4 short sentences of plain guidance. Never clinical, never a bulleted list, never mention being an AI or a model.
- If a canonical Jain verse genuinely fits, include it: Devanāgarī, IAST transliteration, and a faithful one-line English translation. Only include a verse you are confident is authentic and correctly quoted; otherwise omit the verse entirely.
- When a concrete practice would help the seeker, suggest one: a short title and a one-line description.
- If that practice matches one of the app's guided practices, also set "suggestedPractice.practice" so the seeker can begin it in one tap. Allowed values, choose the closest fit or omit if none fits:
  - "samayik" — sitting in equanimity for a set time
  - "pratikraman" — repentance, review of faults, asking and granting forgiveness
  - "khayotsarga" — releasing identification with the body, deep stillness
  - "anupreksha" — structured contemplation / the twelve reflections
  - "japa" — repeating a mantra on a mālā
  - "meditate" — free breath-and-stillness sitting with optional background sound
- Alternatively, when a devotional song would steady the seeker's heart — longing, grief, gratitude, restlessness before sitting — you may point them to a bhajan instead of a practice: set "suggestedPractice.bhajan" to its number from the list you are given, use the bhajan's own name as the title, and give a one-line reason as the description. Suggest a bhajan OR a practice, never both, and only from the provided list.
- Reply with the structured guidance object only — a "text" field, plus an optional "sanskrit" verse and an optional "suggestedPractice".`;

const guidanceInputSchema = z.object({
  text: z.string().min(1),
  sanskrit: z
    .object({
      text: z.string().min(1),
      transliteration: z.string().min(1),
      translation: z.string().min(1),
    })
    .optional(),
  suggestedPractice: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      practice: z.enum(SUGGESTED_PRACTICE_REFS).optional(),
      bhajan: z.number().int().positive().optional(),
    })
    .optional(),
});

/** Number + display title of each bhajan, passed in so the guru can cite one. */
export type BhajanRef = { number: number; title: string };

function buildSystemPrompt(bhajans: BhajanRef[]): string {
  if (bhajans.length === 0) return SYSTEM_PROMPT;
  const list = bhajans.map((b) => `${b.number} — ${b.title}`).join("\n");
  return `${SYSTEM_PROMPT}

Bhajans available in the app (number — name). Only ever set "suggestedPractice.bhajan" to one of these numbers:
${list}`;
}

// Keyword fallback: if the model gave a suggestion but no `practice` ref (or an
// unrecognised one), infer the closest in-app screen from the wording. Specific
// practices are matched before the generic "meditate".
const PRACTICE_KEYWORDS: readonly [SuggestedPracticeRef, RegExp][] = [
  ["pratikraman", /pratikrama|repent|penance|ask(ing)? forgiveness|kṣamāpaṇ|kshamapan|micchami dukkadam/i],
  ["japa", /\bjapa\b|\bjaap\b|chant|\bm[āa]l[āa]\b|navk[aā]r|namok[aā]r|namask[āa]ra|recite .*mantra|mantra .*repetition|count.*bead/i],
  ["samayik", /s[āa]m[āa]yik|equanimity practice|48[- ]?minute|forty[- ]?eight minute/i],
  ["khayotsarga", /k[āha]?[āy]otsarga|kausagg|kāusagg|release the body|body[- ]?stillness|abandon.*body/i],
  ["anupreksha", /anuprek[sṣ]|contemplat|reflection|twelve (reflections|bh[āa]van)|bh[āa]van[āa]/i],
  ["meditate", /medit|breath|mindful|silence|sit quietly|stillness|dhy[āa]na/i],
];

function resolvePracticeRef(sp: { title: string; description: string }): SuggestedPracticeRef | undefined {
  const hay = `${sp.title} ${sp.description}`;
  for (const [ref, re] of PRACTICE_KEYWORDS) if (re.test(hay)) return ref;
  return undefined;
}

/** Normalised conversation turn (history + the current prompt as the last turn). */
type Turn = { role: "user" | "assistant"; content: string };

function buildTurns(prompt: string, history: ChatMessage[]): Turn[] {
  const mapped: Turn[] = history
    .slice(-8)
    .filter((m) => m.text.trim().length > 0)
    .map((m) => ({
      role: (m.role === "guru" ? "assistant" : "user") as Turn["role"],
      content: m.text,
    }));
  // Every provider requires the first turn to come from the user.
  while (mapped.length > 0 && mapped[0].role === "assistant") mapped.shift();
  mapped.push({ role: "user", content: prompt });
  return mapped;
}

/** Drop `null` optionals so they pass `guidanceInputSchema` (which uses `.optional()`). */
function stripNulls(raw: unknown): unknown {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (o.sanskrit === null) delete o.sanskrit;
    if (o.suggestedPractice === null) {
      delete o.suggestedPractice;
    } else if (o.suggestedPractice && typeof o.suggestedPractice === "object") {
      const sp = o.suggestedPractice as Record<string, unknown>;
      if (sp.practice === null || sp.practice === "") delete sp.practice;
      if (sp.bhajan === null || sp.bhajan === 0) delete sp.bhajan;
    }
  }
  return raw;
}

// ── Anthropic ────────────────────────────────────────────────────────────

const deliverGuidanceTool: Anthropic.Tool = {
  name: "deliver_guidance",
  description: "Return the guru's reply to the seeker.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["text"],
    properties: {
      text: {
        type: "string",
        description: "The guru's plain-language guidance, 2–4 short sentences.",
      },
      sanskrit: {
        type: "object",
        additionalProperties: false,
        required: ["text", "transliteration", "translation"],
        description: "An authentic Jain verse, or omit entirely if none fits with confidence.",
        properties: {
          text: { type: "string", description: "The verse in Devanāgarī." },
          transliteration: { type: "string", description: "IAST transliteration." },
          translation: { type: "string", description: "Faithful one-line English translation." },
        },
      },
      suggestedPractice: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          practice: {
            type: "string",
            enum: [...SUGGESTED_PRACTICE_REFS],
            description: "The matching in-app guided practice, or omit if none fits.",
          },
          bhajan: {
            type: "integer",
            description: "A bhajan number from the provided list, when a song fits instead of a practice.",
          },
        },
      },
    },
  },
  strict: true,
};

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  anthropicClient ??= new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    defaultHeaders: env.ANTHROPIC_WORKSPACE_ID
      ? { "anthropic-workspace-id": env.ANTHROPIC_WORKSPACE_ID }
      : undefined,
  });
  return anthropicClient;
}

async function anthropicGenerate(turns: Turn[], system: string): Promise<unknown> {
  const res = await getAnthropic().messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 1024,
    system,
    output_config: { effort: "low" },
    tools: [deliverGuidanceTool],
    tool_choice: { type: "tool", name: "deliver_guidance" },
    messages: turns.map((t) => ({ role: t.role, content: t.content })),
  });

  const toolUse = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === "deliver_guidance",
  );
  if (!toolUse) throw new Error("model did not call deliver_guidance");
  return toolUse.input;
}

// ── OpenAI ───────────────────────────────────────────────────────────────
//
// Strict Structured Outputs: every property must be listed in `required`, so
// the optional blocks are declared nullable and stripped afterwards.

const openaiSchema = {
  type: "object",
  additionalProperties: false,
  required: ["text", "sanskrit", "suggestedPractice"],
  properties: {
    text: { type: "string", description: "The guru's plain-language guidance, 2–4 short sentences." },
    sanskrit: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["text", "transliteration", "translation"],
      properties: {
        text: { type: "string", description: "The verse in Devanāgarī." },
        transliteration: { type: "string", description: "IAST transliteration." },
        translation: { type: "string", description: "Faithful one-line English translation." },
      },
    },
    suggestedPractice: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["title", "description", "practice", "bhajan"],
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        practice: {
          type: ["string", "null"],
          enum: [...SUGGESTED_PRACTICE_REFS, null],
          description: "The matching in-app guided practice, or null if none fits.",
        },
        bhajan: {
          type: ["integer", "null"],
          description: "A bhajan number from the provided list, or null. Suggest a bhajan OR a practice, not both.",
        },
      },
    },
  },
} as const;

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  openaiClient ??= new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL });
  return openaiClient;
}

async function openaiGenerate(turns: Turn[], system: string): Promise<unknown> {
  const res = await getOpenAI().chat.completions.create({
    model: env.OPENAI_MODEL,
    max_completion_tokens: 1024,
    messages: [
      { role: "system", content: system },
      ...turns.map((t) => ({ role: t.role, content: t.content })),
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "guru_guidance", strict: true, schema: openaiSchema },
    },
  });

  const choice = res.choices[0];
  if (choice?.message.refusal) throw new Error(`model refused: ${choice.message.refusal}`);
  const content = choice?.message.content;
  if (!content) throw new Error("empty completion");
  return JSON.parse(content);
}

// ── Google Gemini ────────────────────────────────────────────────────────

const geminiSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    text: {
      type: SchemaType.STRING,
      description: "The guru's plain-language guidance, 2–4 short sentences.",
    },
    sanskrit: {
      type: SchemaType.OBJECT,
      nullable: true,
      description: "An authentic Jain verse, or null if none fits with confidence.",
      properties: {
        text: { type: SchemaType.STRING },
        transliteration: { type: SchemaType.STRING },
        translation: { type: SchemaType.STRING },
      },
      required: ["text", "transliteration", "translation"],
    },
    suggestedPractice: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        practice: {
          type: SchemaType.STRING,
          format: "enum",
          enum: [...SUGGESTED_PRACTICE_REFS],
          nullable: true,
          description: "The matching in-app guided practice, or null if none fits.",
        },
        bhajan: {
          type: SchemaType.INTEGER,
          nullable: true,
          description: "A bhajan number from the provided list, or null. A bhajan OR a practice, not both.",
        },
      },
      required: ["title", "description"],
    },
  },
  required: ["text"],
};

let geminiClient: GoogleGenerativeAI | null = null;
function getGemini(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
  geminiClient ??= new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return geminiClient;
}

async function geminiGenerate(turns: Turn[], system: string): Promise<unknown> {
  const generationConfig = {
    // Headroom: Gemini 3.x "flash" models spend output tokens on internal
    // reasoning, so a tight cap truncates the JSON body.
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
    responseSchema: geminiSchema,
    // Keep reasoning spend small (not 0 — some models reject that).
    thinkingConfig: { thinkingBudget: 128 },
  } as unknown as Parameters<GoogleGenerativeAI["getGenerativeModel"]>[0]["generationConfig"];

  const model = getGemini().getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: system,
    generationConfig,
  });

  const last = turns[turns.length - 1];
  const chat = model.startChat({
    history: turns.slice(0, -1).map((t) => ({
      role: t.role === "assistant" ? "model" : "user",
      parts: [{ text: t.content }],
    })),
  });
  const res = await chat.sendMessage(last.content);
  const raw = res.response.text().trim();
  if (!raw) throw new Error("empty response");
  return JSON.parse(raw);
}

// ── Dispatch (primary + automatic fallback chain) ────────────────────────

type Provider = "anthropic" | "openai" | "gemini";

const providers: Record<
  Provider,
  { hasKey: () => boolean; generate: (turns: Turn[], system: string) => Promise<unknown> }
> = {
  anthropic: { hasKey: () => Boolean(env.ANTHROPIC_API_KEY), generate: anthropicGenerate },
  openai: { hasKey: () => Boolean(env.OPENAI_API_KEY), generate: openaiGenerate },
  gemini: { hasKey: () => Boolean(env.GEMINI_API_KEY), generate: geminiGenerate },
};

const FALLBACK_ORDER: Provider[] = ["anthropic", "openai", "gemini"];
const PROVIDER_TIMEOUT_MS = 30_000;

/** The primary provider first, then every other provider that has a key. */
function providerChain(): Provider[] {
  const primary = env.LLM_PROVIDER;
  return [primary, ...FALLBACK_ORDER.filter((p) => p !== primary)].filter((p) =>
    providers[p].hasKey(),
  );
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    timer.unref();
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}

/**
 * Generate a guru reply. Tries the primary provider (LLM_PROVIDER), then falls
 * through to every other configured provider on error/timeout, all against the
 * same system prompt and structured-output contract. If no provider is
 * configured or all of them fail, returns the offline keyword reply so the
 * feature always answers.
 */
export async function getGuruReply(
  prompt: string,
  history: ChatMessage[] = [],
  opts: { bhajans?: BhajanRef[] } = {},
): Promise<GuruReply> {
  const turns = buildTurns(prompt, history);
  const bhajans = opts.bhajans ?? [];
  const system = buildSystemPrompt(bhajans);
  const bhajanTitles = new Map(bhajans.map((b) => [b.number, b.title]));
  const chain = providerChain();

  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i];
    try {
      const raw = await withTimeout(
        providers[provider].generate(turns, system),
        PROVIDER_TIMEOUT_MS,
        provider,
      );
      const reply = guidanceInputSchema.parse(stripNulls(raw));
      const sp = reply.suggestedPractice;
      if (sp) {
        // Drop a hallucinated bhajan number; a real one wins over a practice tag
        // and gets the catalogue's title so the tile always reads right.
        if (sp.bhajan != null && !bhajanTitles.has(sp.bhajan)) delete sp.bhajan;
        if (sp.bhajan != null) {
          delete sp.practice;
          sp.title = bhajanTitles.get(sp.bhajan) ?? sp.title;
        } else if (!sp.practice) {
          // Model suggested a practice but didn't tag a screen — infer one.
          const ref = resolvePracticeRef(sp);
          if (ref) sp.practice = ref;
        }
      }
      return reply;
    } catch (err) {
      const next = chain[i + 1];
      console.error(
        `[ask-jainam] ${provider} failed${next ? `, falling back to ${next}` : ", using offline reply"}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return getMockGuruReply(prompt);
}

// ── Offline fallback (keyword engine) ─────────────────────────────────────
//
// ⚠️  The Sanskrit / Prākṛt quotations below are AI-drafted and unverified —
//     tracked in REVIEW.md §2.

type Template = GuruReply & { match: RegExp };

const templates: Template[] = [
  {
    match: /ang(er|ry)|krodh|frustrat|irritat|temper/i,
    text: "Anger burns the one who holds it first. When it rises, pause and breathe. Forgive, and ask forgiveness — this is the essence of kṣamā. Kṣamāpaṇā frees the soul from a weight it was never meant to carry.",
    sanskrit: {
      text: "क्षमा वीरस्य भूषणम्",
      transliteration: "Kshama virasya bhushanam",
      translation: "Forgiveness is the ornament of the brave.",
    },
    suggestedPractice: {
      title: "Kṣamāpaṇā reflection",
      description: "Silently offer forgiveness to one person today.",
      practice: "pratikraman",
    },
  },
  {
    match: /attach|desire|possess|crav|greed|parigrah/i,
    text: "Every possession you hold also holds you. Aparigraha is not poverty but freedom — needing less, you carry less. Loosen one grip today and notice how the mind lightens.",
    sanskrit: {
      text: "इच्छा हु आगाससमा अणंतिया",
      transliteration: "Ichha hu agasasama anantiya",
      translation: "Desire is as endless as the sky.",
    },
    suggestedPractice: {
      title: "Aparigraha practice",
      description: "Give away one thing you have not used in a year.",
    },
  },
  {
    match: /fear|afraid|death|die|scared/i,
    text: "The soul is never born and never dies; only the body changes. Fear loosens its hold when you rest attention on that which is untouched by time. Sit with the breath and let the knowing self come forward.",
    sanskrit: {
      text: "न हि जीवो न हि मरणं",
      transliteration: "Na hi jivo na hi maranam",
      translation: "For the soul, there is neither birth nor death.",
    },
    suggestedPractice: {
      title: "8 min Khāyotsarga",
      description: "Release the body, rest in the soul.",
      practice: "khayotsarga",
    },
  },
  {
    match: /purpose|meaning|path|lost|direction/i,
    text: "The path is walked with Right Faith, Right Knowledge, and Right Conduct together — none alone completes it. Begin where you are: one honest act, one clear seeing, one steady step.",
    sanskrit: {
      text: "सम्यग्दर्शनज्ञानचारित्राणि मोक्षमार्गः",
      transliteration: "Samyak-darshana-jnana-charitrani mokshamargah",
      translation: "Right faith, knowledge and conduct are the path to liberation.",
    },
    suggestedPractice: {
      title: "12 min Anupreksha",
      description: "Contemplate and reflect deeply on your intention.",
      practice: "anupreksha",
    },
  },
];

const fallback: GuruReply = {
  text: "Sit quietly for a moment. Watch the breath without changing it. Whatever you are carrying, meet it with equanimity — samatā — and it will begin to settle. Return to this stillness whenever the day pulls you away.",
  sanskrit: {
    text: "समता सर्वत्र भूयात्",
    transliteration: "Samata sarvatra bhuyat",
    translation: "Let equanimity prevail everywhere.",
  },
  suggestedPractice: {
    title: "10 min Samayik",
    description: "Be in the present with equanimity.",
    practice: "samayik",
  },
};

export function getMockGuruReply(prompt: string): GuruReply {
  const hit = templates.find((t) => t.match.test(prompt));
  if (!hit) return fallback;
  return {
    text: hit.text,
    sanskrit: hit.sanskrit,
    suggestedPractice: hit.suggestedPractice,
  };
}
