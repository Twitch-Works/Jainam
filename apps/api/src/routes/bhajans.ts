import type { FastifyPluginAsync } from "fastify";
import type { BhajanDetail, BhajanLyricLine, BhajanSummary } from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

const BUCKET = "bhajans";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 6; // 6h — comfortably longer than a listen

type BhajanRow = {
  id: string;
  number: number;
  title: string | null;
  tune: string;
  lyrics_lines: BhajanLyricLine[] | null;
  audio_path: string | null;
  needs_review: boolean;
  review_notes: string | null;
};

const displayTitle = (r: Pick<BhajanRow, "title" | "tune">) =>
  r.title && r.title.trim().length > 0 ? r.title : r.tune;

const toSummary = (r: BhajanRow): BhajanSummary => ({
  id: r.id,
  number: r.number,
  title: displayTitle(r),
  needsReview: r.needs_review,
});

const bhajanRoutes: FastifyPluginAsync = async (app) => {
  // List — titles only, ordered.
  app.get("/bhajans", async () => {
    const { data, error } = await serviceClient
      .from("bhajans")
      .select("id, number, title, tune, needs_review")
      .order("sort_order", { ascending: true });
    assertNoDbError(app, error, "load bhajans");
    return { bhajans: ((data ?? []) as BhajanRow[]).map(toSummary) };
  });

  // One bhajan — full lyrics + a fresh signed audio URL.
  app.get<{ Params: { number: string } }>("/bhajans/:number", async (request) => {
    const number = Number.parseInt(request.params.number, 10);
    if (!Number.isInteger(number) || number <= 0) {
      throw app.httpErrors.badRequest("Bhajan number must be a positive integer.");
    }

    const { data, error } = await serviceClient
      .from("bhajans")
      .select("id, number, title, tune, lyrics_lines, audio_path, needs_review, review_notes")
      .eq("number", number)
      .maybeSingle();
    assertNoDbError(app, error, "load bhajan");
    if (!data) throw app.httpErrors.notFound(`No bhajan #${number}.`);

    const row = data as BhajanRow;

    let audioUrl: string | null = null;
    if (row.audio_path) {
      const signed = await serviceClient.storage
        .from(BUCKET)
        .createSignedUrl(row.audio_path, SIGNED_URL_TTL_SECONDS);
      if (signed.error) {
        app.log.error({ err: signed.error }, "failed to sign bhajan audio URL");
      } else {
        audioUrl = signed.data.signedUrl;
      }
    }

    const detail: BhajanDetail = {
      ...toSummary(row),
      tune: row.tune,
      lyricsLines: row.lyrics_lines ?? [],
      reviewNotes: row.review_notes,
      audioUrl,
    };
    return detail;
  });
};

export default bhajanRoutes;
