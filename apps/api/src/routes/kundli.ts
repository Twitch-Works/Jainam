import type { FastifyPluginAsync } from "fastify";
import type { KundliData, TodayGuidance } from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

const kundliRoutes: FastifyPluginAsync = async (app) => {
  // NOTE: illustrative content only — see REVIEW.md §3. Real values need a
  // Jain-jyotiṣ computation source keyed off the user's birth data.
  app.get("/kundli", async () => {
    const [themes, guidance] = await Promise.all([
      serviceClient
        .from("kundli_life_themes")
        .select("id, title, value")
        .order("sort_order", { ascending: true }),
      serviceClient
        .from("kundli_guidance")
        .select("status, note, remedy")
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    assertNoDbError(app, themes.error, "load kundli life themes");
    assertNoDbError(app, guidance.error, "load kundli guidance");

    const payload: KundliData = {
      lifeThemes: (themes.data ?? []).map((t) => ({
        id: t.id as string,
        title: t.title as string,
        value: t.value as string,
      })),
      guidance: (guidance.data as TodayGuidance | null) ?? {
        status: "Neutral",
        note: "",
        remedy: "",
      },
    };
    return payload;
  });
};

export default kundliRoutes;
