import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, type JWTPayload } from "jose";
import { env } from "../env.js";

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
};

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUser | null;
    /** Access token from the Authorization header, if present. */
    accessToken: string | null;
  }
  interface FastifyInstance {
    /** preHandler that 401s unless a valid Supabase access token is present. */
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

// Supabase signs access tokens either with the legacy HS256 shared secret or,
// on projects using JWT signing keys, with an asymmetric key (ES256/RS256)
// published at the project's JWKS endpoint. Support both.
const hsSecret = env.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(env.SUPABASE_JWT_SECRET)
  : null;
const jwks = createRemoteJWKSet(
  new URL(`${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json`),
);

async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { alg } = decodeProtectedHeader(token);
  if (alg === "HS256") {
    if (!hsSecret) throw new Error("HS256 token but SUPABASE_JWT_SECRET is not set");
    const { payload } = await jwtVerify(token, hsSecret, { algorithms: ["HS256"] });
    return payload;
  }
  const { payload } = await jwtVerify(token, jwks);
  return payload;
}

function readBearer(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

const authPlugin: FastifyPluginAsync = async (app) => {
  // Populate request.user for every request (best-effort, never throws).
  app.decorateRequest("user", null);
  app.decorateRequest("accessToken", null);

  app.addHook("onRequest", async (request) => {
    const token = readBearer(request);
    if (!token) return;
    try {
      const payload = await verifyAccessToken(token);
      if (!payload.sub) return;
      request.user = {
        id: String(payload.sub),
        email: (payload.email as string | undefined) ?? null,
        phone: (payload.phone as string | undefined) ?? null,
      };
      request.accessToken = token;
    } catch {
      // Invalid / expired token → treat as anonymous; protected routes 401 below.
    }
  });

  app.decorate("authenticate", async (request: FastifyRequest) => {
    if (!request.user) {
      throw app.httpErrors.unauthorized("A valid access token is required.");
    }
  });
};

export default fp(authPlugin, { name: "auth" });
