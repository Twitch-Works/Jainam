import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env.js";

/**
 * Service-role client — bypasses RLS. Use for content reads and for
 * user-scoped writes where the route has already checked `request.user.id`.
 * Never expose this key to the client.
 */
export const serviceClient: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * A client that carries the caller's access token, so Postgres RLS is
 * enforced with `auth.uid()` set to that user. Defence-in-depth for
 * user-data routes.
 */
export function userClient(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
