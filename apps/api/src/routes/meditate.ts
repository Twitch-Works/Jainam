import type { FastifyPluginAsync } from "fastify";
import type { MeditationSound } from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

const meditateRoutes: FastifyPluginAsync = async (app) => {
  app.get("/meditate/sounds", async () => {
    const { data, error } = await serviceClient
      .from("meditation_sounds")
      .select("slug, title, description, audio_url, loop")
      .order("sort_order", { ascending: true });
    assertNoDbError(app, error, "load meditation sounds");

    const sounds: MeditationSound[] = (data ?? []).map((r) => ({
      id: r.slug as string,
      title: r.title as string,
      description: r.description as string,
      audioUrl: (r.audio_url as string | null) ?? null,
      loop: r.loop as boolean,
    }));
    return { sounds };
  });
};

export default meditateRoutes;
