import type { FastifyInstance } from "fastify";
import type { PostgrestError } from "@supabase/supabase-js";

/** Turn a Supabase/PostgREST error into an HTTP error Fastify can serialise. */
export function assertNoDbError(
  app: FastifyInstance,
  error: PostgrestError | null,
  context: string,
): asserts error is null {
  if (!error) return;
  app.log.error({ err: error, context }, "database error");
  throw app.httpErrors.internalServerError(`Failed to ${context}.`);
}
