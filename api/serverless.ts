/**
 * Vercel serverless entry for the Jainam API — DO NOT rename this file and DO
 * NOT change the import path below.
 *
 *  - Filename must NOT be `index` — Vercel serves `api/index.ts` only at `/api`,
 *    which breaks the catch-all rewrite. `serverless` maps cleanly to
 *    `/api/serverless`, matching `vercel.json` → rewrites.
 *  - The import points at the COMPILED app. This folder is at the repo root, so
 *    the API's build output is two levels down: `../apps/api/dist/app.js`.
 *    `vercel.json` → buildCommand runs `tsc` for @jainam/api (+ @jainam/shared)
 *    before this function is bundled, so the file exists at build time.
 *
 * Vercel can't run a long-lived `listen()`, so we import `buildApp()` and hand
 * each request to Fastify's underlying server.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../apps/api/dist/app.js";

// Build once per warm instance; reuse across invocations.
const ready = (async () => {
  const app = await buildApp();
  await app.ready();
  return app;
})();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await ready;
  // Some Vercel configs forward the rewrite destination instead of the original
  // path — strip it so Fastify sees the real route (`/health`, `/api/...`).
  if (req.url?.startsWith("/api/serverless")) {
    req.url = req.url.slice("/api/serverless".length) || "/";
  }
  app.server.emit("request", req, res);
}
