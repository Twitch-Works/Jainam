/**
 * Vercel entrypoint. Vercel can't run a long-lived `listen()`, so it invokes
 * this function per request and we hand it to Fastify. `vercel.json` rewrites
 * every path here; Fastify sees the original URL and routes it.
 *
 * `../dist/app.js` = the compiled app (`vercel.json` → buildCommand runs `tsc`
 * for @jainam/api + @jainam/shared first).
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../dist/app.js";

const ready = buildApp().then(async (app) => {
  await app.ready();
  return app;
});

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  (await ready).server.emit("request", req, res);
}
