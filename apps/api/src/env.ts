import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

// Load repo-root .env first, then a package-local .env if present (overrides).
loadDotenv({ path: [resolve(process.cwd(), "../../.env"), resolve(process.cwd(), ".env")] });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // App-level environment (independent of NODE_ENV). Controls dev conveniences
  // like skipping email confirmation. Default: development.
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default("0.0.0.0"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Only needed for projects still using the legacy HS256 shared secret;
  // projects with JWT signing keys are verified via the JWKS endpoint.
  SUPABASE_JWT_SECRET: z.string().min(16).optional(),

  // Ask Jainam — the PRIMARY LLM. On error/timeout the route automatically
  // falls through to every other provider that has an API key set (order:
  // anthropic → openai → gemini), then to the offline keyword engine. Set as
  // many keys as you like; set only one to pin a single provider.
  LLM_PROVIDER: z.enum(["anthropic", "openai", "gemini"]).default("anthropic"),

  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-opus-5"),
  // Required only if ANTHROPIC_API_KEY is a workspace-/identity-linked key
  // (Console shows "This key is linked to a workspace").
  ANTHROPIC_WORKSPACE_ID: z.string().min(1).optional(),

  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  // Optional: point the OpenAI SDK at a compatible gateway (Azure, OpenRouter…).
  OPENAI_BASE_URL: z.string().url().optional(),

  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.6-flash"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "✖ Invalid API environment:\n" +
      parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n") +
      "\n\nCopy .env.example to .env at the repo root and fill it in (see `pnpm db:start`).",
  );
  process.exit(1);
}

export const env = parsed.data;
