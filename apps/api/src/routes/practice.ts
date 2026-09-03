import type { FastifyPluginAsync } from "fastify";
import { recordPracticeSessionSchema, type RecordPracticeResult } from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

const practiceRoutes: FastifyPluginAsync = async (app) => {
  // Log a completed practice session → updates user_stats, user_consistency
  // and the sādhak level atomically via record_practice_session().
  app.post("/practice/sessions", { preHandler: app.authenticate }, async (request) => {
    const body = recordPracticeSessionSchema.parse(request.body);

    const { data, error } = await serviceClient.rpc("record_practice_session", {
      p_user: request.user!.id,
      p_kind: body.kind,
      p_minutes: body.minutes,
      p_steps: body.steps,
      p_mantras: body.mantras,
    });
    assertNoDbError(app, error, "record practice session");

    return (data ?? { ok: true, xpAwarded: 0, leveledUp: false, level: "" }) as RecordPracticeResult;
  });
};

export default practiceRoutes;
