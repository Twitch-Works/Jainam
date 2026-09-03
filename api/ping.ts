/**
 * Zero-dependency diagnostic. If GET /api/ping works but /health (rewritten to
 * /api/serverless) does not, the problem is the Fastify wrapper or its bundling
 * — not Vercel's function detection. Safe to delete once /health is confirmed.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ ok: true, fn: "ping", ts: new Date().toISOString() }));
}
