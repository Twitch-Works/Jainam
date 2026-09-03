import type { FastifyPluginAsync } from "fastify";
import type { IconKey, PracticeKind, SadhanaPractice } from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

type GuidanceRow = { step_no: number; heading: string; body: string; weight: number };

type Row = {
  slug: string;
  icon: string;
  title: string;
  description: string;
  duration: string;
  featured_on_home: boolean;
  session_kind: string | null;
  session_minutes: number;
  session_mantras: number;
  mantra_text: string | null;
  mantra_transliteration: string | null;
  mantra_translation: string | null;
  sadhana_guidance: GuidanceRow[] | null;
};

const toPractice = (row: Row): SadhanaPractice => ({
  id: row.slug,
  icon: row.icon as IconKey,
  title: row.title,
  description: row.description,
  duration: row.duration,
  sessionKind: (row.session_kind as PracticeKind | null) ?? undefined,
  sessionMinutes: row.session_minutes || undefined,
  sessionMantras: row.session_mantras || undefined,
  guidance:
    row.sadhana_guidance && row.sadhana_guidance.length > 0
      ? [...row.sadhana_guidance]
          .sort((a, b) => a.step_no - b.step_no)
          .map((g) => ({ heading: g.heading, body: g.body, weight: g.weight }))
      : undefined,
  mantra:
    row.mantra_text && row.mantra_transliteration && row.mantra_translation
      ? {
          text: row.mantra_text,
          transliteration: row.mantra_transliteration,
          translation: row.mantra_translation,
        }
      : undefined,
});

const sadhanaRoutes: FastifyPluginAsync = async (app) => {
  app.get("/sadhana", async () => {
    const { data, error } = await serviceClient
      .from("sadhana_practices")
      .select(
        "slug, icon, title, description, duration, featured_on_home, session_kind, session_minutes, session_mantras, mantra_text, mantra_transliteration, mantra_translation, sadhana_guidance(step_no, heading, body, weight)",
      )
      .order("sort_order", { ascending: true });
    assertNoDbError(app, error, "load sadhana practices");

    const rows = (data ?? []) as Row[];
    const featured = rows.find((r) => r.featured_on_home);
    return {
      practices: rows.filter((r) => !r.featured_on_home).map(toPractice),
      suggested: featured ? toPractice(featured) : null,
    };
  });
};

export default sadhanaRoutes;
