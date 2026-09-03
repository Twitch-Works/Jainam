import type { FastifyPluginAsync } from "fastify";
import {
  SUGGESTED_PRACTICE_REFS,
  chatHistoryQuerySchema,
  sendChatMessageSchema,
  type ChatMessage,
  type SuggestedPracticeRef,
} from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";
import { getGuruReply } from "../lib/guru.js";

const MSG_COLS =
  "id, role, text, sanskrit_text, sanskrit_transliteration, sanskrit_translation, suggested_title, suggested_description, suggested_practice, created_at";

type MsgRow = {
  id: string;
  role: "user" | "guru";
  text: string;
  sanskrit_text: string | null;
  sanskrit_transliteration: string | null;
  sanskrit_translation: string | null;
  suggested_title: string | null;
  suggested_description: string | null;
  suggested_practice: string | null;
  created_at: string;
};

const asPracticeRef = (v: string | null): SuggestedPracticeRef | undefined =>
  v && (SUGGESTED_PRACTICE_REFS as readonly string[]).includes(v)
    ? (v as SuggestedPracticeRef)
    : undefined;

const toMessage = (row: MsgRow): ChatMessage => ({
  id: row.id,
  role: row.role,
  text: row.text,
  sanskrit:
    row.sanskrit_text && row.sanskrit_transliteration && row.sanskrit_translation
      ? {
          text: row.sanskrit_text,
          transliteration: row.sanskrit_transliteration,
          translation: row.sanskrit_translation,
        }
      : undefined,
  suggestedPractice:
    row.suggested_title && row.suggested_description
      ? {
          title: row.suggested_title,
          description: row.suggested_description,
          practice: asPracticeRef(row.suggested_practice),
        }
      : undefined,
  createdAt: row.created_at,
});

const askJainamRoutes: FastifyPluginAsync = async (app) => {
  // Paged newest-first. `?limit=` (default 10) caps the page; `?before=<ISO>`
  // (a prior page's `nextCursor`) fetches the next older page. The app loads
  // one page on open and pulls older pages as the user scrolls up.
  app.get("/ask-jainam/messages", { preHandler: app.authenticate }, async (request) => {
    const { before, limit } = chatHistoryQuerySchema.parse(request.query);
    const userId = request.user!.id;

    let query = serviceClient
      .from("chat_messages")
      .select(MSG_COLS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit + 1); // one extra row → tells us whether an older page exists
    if (before) query = query.lt("created_at", before);

    const { data, error } = await query;
    assertNoDbError(app, error, "load chat history");
    const rows = (data ?? []) as MsgRow[];

    // Brand-new user (no history, first page): show the seed conversation.
    if (rows.length === 0 && !before) {
      const seed = await serviceClient
        .from("ask_jainam_seed_messages")
        .select(
          "id, role, text, sanskrit_text, sanskrit_transliteration, sanskrit_translation, suggested_title, suggested_description, suggested_practice",
        )
        .order("sort_order", { ascending: false });
      assertNoDbError(app, seed.error, "load seed conversation");
      return {
        messages: (seed.data ?? []).map((row) =>
          toMessage({
            ...(row as Omit<MsgRow, "created_at">),
            created_at: new Date(0).toISOString(),
          }),
        ),
        hasMore: false,
        nextCursor: null,
      };
    }

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    return {
      messages: page.map(toMessage),
      hasMore,
      nextCursor: page.length > 0 ? page[page.length - 1].created_at : null,
    };
  });

  app.post("/ask-jainam/messages", { preHandler: app.authenticate }, async (request) => {
    const { text } = sendChatMessageSchema.parse(request.body);
    const userId = request.user!.id;

    // Recent turns for conversational context.
    const historyRes = await serviceClient
      .from("chat_messages")
      .select(MSG_COLS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    assertNoDbError(app, historyRes.error, "load chat context");
    const history = ((historyRes.data ?? []) as MsgRow[]).reverse().map(toMessage);

    const reply = await getGuruReply(text, history);
    const now = Date.now();

    // First real message: also persist the seed exchange so history stays
    // continuous (matches what a brand-new user saw on GET).
    if (history.length === 0) {
      const seed = await serviceClient
        .from("ask_jainam_seed_messages")
        .select(
          "role, text, sanskrit_text, sanskrit_transliteration, sanskrit_translation, suggested_title, suggested_description, suggested_practice, sort_order",
        )
        .order("sort_order", { ascending: true });
      assertNoDbError(app, seed.error, "load seed conversation");
      if (seed.data?.length) {
        const seedRows = seed.data.map((r, i) => ({
          user_id: userId,
          role: r.role as "user" | "guru",
          text: r.text as string,
          sanskrit_text: (r.sanskrit_text as string | null) ?? null,
          sanskrit_transliteration: (r.sanskrit_transliteration as string | null) ?? null,
          sanskrit_translation: (r.sanskrit_translation as string | null) ?? null,
          suggested_title: (r.suggested_title as string | null) ?? null,
          suggested_description: (r.suggested_description as string | null) ?? null,
          suggested_practice: (r.suggested_practice as string | null) ?? null,
          created_at: new Date(now - 60_000 + i).toISOString(),
        }));
        const seeded = await serviceClient.from("chat_messages").insert(seedRows);
        assertNoDbError(app, seeded.error, "persist seed conversation");
      }
    }

    const { data, error } = await serviceClient
      .from("chat_messages")
      .insert([
        { user_id: userId, role: "user", text, created_at: new Date(now).toISOString() },
        {
          user_id: userId,
          role: "guru",
          text: reply.text,
          sanskrit_text: reply.sanskrit?.text ?? null,
          sanskrit_transliteration: reply.sanskrit?.transliteration ?? null,
          sanskrit_translation: reply.sanskrit?.translation ?? null,
          suggested_title: reply.suggestedPractice?.title ?? null,
          suggested_description: reply.suggestedPractice?.description ?? null,
          suggested_practice: reply.suggestedPractice?.practice ?? null,
          created_at: new Date(now + 1).toISOString(),
        },
      ])
      .select(MSG_COLS)
      .order("created_at", { ascending: true });
    assertNoDbError(app, error, "save chat messages");

    const rows = (data ?? []) as MsgRow[];
    const userRow = rows.find((r) => r.role === "user");
    const guruRow = rows.find((r) => r.role === "guru");
    return {
      userMessage: userRow ? toMessage(userRow) : null,
      guruMessage: guruRow ? toMessage(guruRow) : null,
    };
  });
};

export default askJainamRoutes;
