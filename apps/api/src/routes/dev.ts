import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { serviceClient } from "../lib/supabase.js";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
  name: z.string().max(80).optional(),
});

/**
 * Development / test convenience routes. Registered by `app.ts` ONLY when
 * APP_ENV !== "production" — never mounted in prod.
 */
const devRoutes: FastifyPluginAsync = async (app) => {
  // Create an already-confirmed user with the service role, so local dev never
  // touches the confirmation-email pipeline (no email link, no rate limits).
  // The app calls this instead of supabase.auth.signUp() when APP_ENV != prod,
  // then signs in normally.
  app.post("/dev/sign-up", async (request) => {
    const { email, password, name } = signUpSchema.parse(request.body);

    const { error } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: name ? { name } : undefined,
    });

    if (error) {
      const already = /already.*(registered|exists)/i.test(error.message) || error.status === 422;
      if (already) throw app.httpErrors.conflict("An account with this email already exists.");
      throw app.httpErrors.internalServerError(error.message);
    }
    return { ok: true } as const;
  });
};

export default devRoutes;
