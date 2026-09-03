import type { FastifyPluginAsync } from "fastify";
import {
  pratikramanStepsQuerySchema,
  updatePratikramanGoalSchema,
  updatePratikramanProgressSchema,
  type Avashyaka,
  type PratikramanPhase,
  type PratikramanProgress,
  type PratikramanStep,
  type PratikramanType,
  type PratikramanTypeId,
} from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

const DEFAULT_GOAL = "Complete Pratikraman calmly, without rushing, every evening.";

const pratikramanRoutes: FastifyPluginAsync = async (app) => {
  // ── Content ──────────────────────────────────────────────────────────────
  app.get("/pratikraman/types", async () => {
    const { data, error } = await serviceClient
      .from("pratikraman_types")
      .select("slug, name, cadence, blurb, content_ready")
      .order("sort_order", { ascending: true });
    assertNoDbError(app, error, "load pratikraman types");
    const types: PratikramanType[] = (data ?? []).map((r) => ({
      id: r.slug as PratikramanTypeId,
      name: r.name as string,
      cadence: r.cadence as string,
      blurb: r.blurb as string,
      contentReady: r.content_ready as boolean,
    }));
    return { types };
  });

  app.get("/pratikraman/avashyaka", async () => {
    const { data, error } = await serviceClient
      .from("six_avashyaka")
      .select("num, name, gloss")
      .order("num", { ascending: true });
    assertNoDbError(app, error, "load six avashyaka");
    return { avashyaka: (data ?? []) as Avashyaka[] };
  });

  app.get("/pratikraman/steps", async (request) => {
    const query = pratikramanStepsQuerySchema.parse(request.query);
    // Rāi / Pakkhī / Chaumāsī / Sāṃvatsarī reuse the Devasi sequence for now
    // (see REVIEW.md §1). Steps are stored once, keyed by length.
    const { data, error } = await serviceClient
      .from("pratikraman_steps")
      .select("id, phase, title, instruction, recitation")
      .eq("length", query.length)
      .order("step_no", { ascending: true });
    assertNoDbError(app, error, "load pratikraman steps");

    const steps: PratikramanStep[] = (data ?? []).map((r) => ({
      id: r.id as string,
      phase: r.phase as PratikramanPhase,
      title: r.title as string,
      instruction: r.instruction as string,
      recitation: (r.recitation as string | null) ?? undefined,
    }));
    return { steps, type: query.type, length: query.length };
  });

  // ── Per-user progress ────────────────────────────────────────────────────
  app.get("/pratikraman/progress", { preHandler: app.authenticate }, async (request) => {
    const { data, error } = await serviceClient
      .from("user_pratikraman_progress")
      .select("type_slug, length, completed_steps")
      .eq("user_id", request.user!.id);
    assertNoDbError(app, error, "load pratikraman progress");
    const progress: PratikramanProgress[] = (data ?? []).map((r) => ({
      typeSlug: r.type_slug as PratikramanTypeId,
      length: r.length as PratikramanProgress["length"],
      completedSteps: r.completed_steps as number,
    }));
    return { progress };
  });

  app.put("/pratikraman/progress", { preHandler: app.authenticate }, async (request) => {
    const body = updatePratikramanProgressSchema.parse(request.body);
    const { error } = await serviceClient.from("user_pratikraman_progress").upsert(
      {
        user_id: request.user!.id,
        type_slug: body.typeSlug,
        length: body.length,
        completed_steps: body.completedSteps,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,type_slug,length" },
    );
    assertNoDbError(app, error, "save pratikraman progress");
    return { ok: true } as const;
  });

  // ── Per-user goal ────────────────────────────────────────────────────────
  app.get("/pratikraman/goal", { preHandler: app.authenticate }, async (request) => {
    const { data, error } = await serviceClient
      .from("user_pratikraman_goal")
      .select("goal")
      .eq("user_id", request.user!.id)
      .maybeSingle();
    assertNoDbError(app, error, "load pratikraman goal");
    return { goal: (data?.goal as string | undefined) ?? DEFAULT_GOAL };
  });

  app.put("/pratikraman/goal", { preHandler: app.authenticate }, async (request) => {
    const { goal } = updatePratikramanGoalSchema.parse(request.body);
    const { error } = await serviceClient.from("user_pratikraman_goal").upsert(
      { user_id: request.user!.id, goal, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    assertNoDbError(app, error, "save pratikraman goal");
    return { goal };
  });
};

export default pratikramanRoutes;
