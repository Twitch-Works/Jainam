import type { FastifyPluginAsync } from "fastify";
import type { CoreBelief, IconKey, LibraryContent } from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

type BeliefRow = {
  id: string;
  kind: "essence" | "practice";
  icon: string;
  title: string;
  description: string;
};

const toBelief = (row: BeliefRow): CoreBelief => ({
  id: row.id,
  kind: row.kind,
  icon: row.icon as IconKey,
  title: row.title,
  description: row.description,
});

const wisdomRoutes: FastifyPluginAsync = async (app) => {
  // Rotates daily: a thought pinned to today wins; otherwise pick from the
  // active pool by (UTC epoch-day mod pool size), so it's stable within a day
  // and cycles through every entry.
  app.get("/wisdom/thought", async () => {
    const today = new Date().toISOString().slice(0, 10);

    const pinned = await serviceClient
      .from("wisdom_thoughts")
      .select("transliteration, translation, source")
      .eq("for_date", today)
      .maybeSingle();
    assertNoDbError(app, pinned.error, "load thought of the day");
    if (pinned.data) return pinned.data;

    const pool = await serviceClient
      .from("wisdom_thoughts")
      .select("transliteration, translation, source")
      .eq("active", true)
      .is("for_date", null)
      .order("sort_order", { ascending: true });
    assertNoDbError(app, pool.error, "load thought of the day");

    const rows = pool.data ?? [];
    if (rows.length === 0) throw app.httpErrors.notFound("No thought of the day is configured.");

    const epochDay = Math.floor(Date.now() / 86_400_000);
    return rows[epochDay % rows.length];
  });

  app.get("/wisdom/library", async () => {
    const [categories, scripture, beliefs, reading] = await Promise.all([
      serviceClient.from("library_categories").select("name").order("sort_order", { ascending: true }),
      serviceClient
        .from("featured_scriptures")
        .select("title, author")
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle(),
      serviceClient
        .from("core_beliefs")
        .select("id, kind, icon, title, description")
        .order("sort_order", { ascending: true }),
      serviceClient
        .from("continue_reading")
        .select("title, chapter, time_left")
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    assertNoDbError(app, categories.error, "load library categories");
    assertNoDbError(app, scripture.error, "load featured scripture");
    assertNoDbError(app, beliefs.error, "load core beliefs");
    assertNoDbError(app, reading.error, "load continue reading");

    const beliefRows = (beliefs.data ?? []) as BeliefRow[];

    const payload: LibraryContent = {
      categories: (categories.data ?? []).map((c) => c.name as string),
      featuredScripture: scripture.data
        ? { title: scripture.data.title as string, author: scripture.data.author as string }
        : { title: "", author: "" },
      coreBeliefs: beliefRows.filter((b) => b.kind === "essence").map(toBelief),
      corePractices: beliefRows.filter((b) => b.kind === "practice").map(toBelief),
      continueReading: reading.data
        ? {
            title: reading.data.title as string,
            chapter: reading.data.chapter as string,
            timeLeft: reading.data.time_left as string,
          }
        : { title: "", chapter: "", timeLeft: "" },
    };
    return payload;
  });
};

export default wisdomRoutes;
