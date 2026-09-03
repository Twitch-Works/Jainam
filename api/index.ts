/**
 * Vercel serverless entry for the Jainam API.
 *
 * Vercel can't run a long-lived `listen()` server, so instead of
 * `apps/api/src/server.ts` we import the built Fastify app and hand each
 * request to it. `vercel.json` rewrites every path here.
 *
 * Build (`vercel.json` → buildCommand) produces `apps/api/dist/` and
 * `packages/shared/dist/` before this function is bundled.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../apps/api/dist/app.js";

// Build the app once per warm instance; reuse across invocations.
const ready = (async () => {
  const app = await buildApp();
  await app.ready();
  return app;
})();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await ready;
  app.server.emit("request", req, res);
}
