/**
 * Vercel serverless entry for the whole Jainam API.
 *
 * The Vercel project's Root Directory is the repo root, so Vercel scans this
 * `api/` folder for functions. `vercel.json` → routes forwards every non-file
 * request to `/api/serverless/<original path>`; this optional catch-all
 * receives it, strips the `/api/serverless` prefix, and hands the real path to
 * Fastify.
 *
 * DO NOT change the import: this file is at `api/serverless/`, two levels under
 * the repo root, and the API compiles to `apps/api/dist/`. `vercel.json` →
 * buildCommand runs `tsc` (@jainam/api + @jainam/shared, incl. `.d.ts`) before
 * this function is bundled, so the file exists at build time.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../../apps/api/dist/app.js";

const PREFIX = "/api/serverless";

// Build once per warm instance; reuse across invocations.
const ready = (async () => {
  const app = await buildApp();
  await app.ready();
  return app;
})();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await ready;
  if (req.url === PREFIX || req.url === `${PREFIX}/`) {
    req.url = "/";
  } else if (req.url?.startsWith(`${PREFIX}/`)) {
    req.url = req.url.slice(PREFIX.length);
  }
  app.server.emit("request", req, res);
}
