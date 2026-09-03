import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import {
  updatePreferencesSchema,
  updateProfileSchema,
  type ConsistencyPoint,
  type Me,
  type UserPreferences,
  type UserStats,
} from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ZERO_STATS: UserStats = {
  meditationMinutes: 0,
  pratikramanSessions: 0,
  ahimsaScore: 0,
  longestMeditation: 0,
  totalPratikramanSteps: 0,
  mantrasChanted: 0,
};

type StatsRow = {
  meditation_minutes: number;
  pratikraman_sessions: number;
  ahimsa_score: number;
  longest_meditation: number;
  total_pratikraman_steps: number;
  mantras_chanted: number;
};

const toStats = (row: StatsRow | null): UserStats =>
  row
    ? {
        meditationMinutes: row.meditation_minutes,
        pratikramanSessions: row.pratikraman_sessions,
        ahimsaScore: row.ahimsa_score,
        longestMeditation: row.longest_meditation,
        totalPratikramanSteps: row.total_pratikraman_steps,
        mantrasChanted: row.mantras_chanted,
      }
    : { ...ZERO_STATS };

async function loadMe(userId: string, app: FastifyInstance): Promise<Me> {
  const [profile, stats, consistency] = await Promise.all([
    serviceClient
      .from("profiles")
      .select("id, email, phone, name, role, sadhak_level, xp, xp_to_next, vows")
      .eq("id", userId)
      .maybeSingle(),
    serviceClient
      .from("user_stats")
      .select(
        "meditation_minutes, pratikraman_sessions, ahimsa_score, longest_meditation, total_pratikraman_steps, mantras_chanted",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    serviceClient
      .from("user_consistency")
      .select("weekday, value")
      .eq("user_id", userId)
      .order("weekday", { ascending: true }),
  ]);

  assertNoDbError(app, profile.error, "load profile");
  assertNoDbError(app, stats.error, "load stats");
  assertNoDbError(app, consistency.error, "load consistency");

  if (!profile.data) throw app.httpErrors.notFound("Profile not found.");

  const byDay = new Map<number, number>(
    (consistency.data ?? []).map((r) => [r.weekday as number, Number(r.value)]),
  );
  const consistencyPoints: ConsistencyPoint[] = WEEKDAYS.map((day, i) => ({
    day,
    value: byDay.get(i) ?? 0,
  }));

  return {
    profile: {
      id: profile.data.id as string,
      email: (profile.data.email as string | null) ?? null,
      phone: (profile.data.phone as string | null) ?? null,
      name: (profile.data.name as string) ?? "",
      role: (profile.data.role as string) ?? "",
      sadhakLevel: (profile.data.sadhak_level as string) ?? "",
      xp: (profile.data.xp as number) ?? 0,
      xpToNext: (profile.data.xp_to_next as number) ?? 0,
      vows: (profile.data.vows as string[] | null) ?? [],
    },
    stats: toStats(stats.data as StatsRow | null),
    consistency: consistencyPoints,
  };
}

const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", { preHandler: app.authenticate }, async (request) => {
    return loadMe(request.user!.id, app);
  });

  app.patch("/me", { preHandler: app.authenticate }, async (request) => {
    const body = updateProfileSchema.parse(request.body);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) patch.name = body.name;
    if (body.role !== undefined) patch.role = body.role;
    if (body.vows !== undefined) patch.vows = body.vows;

    const { error } = await serviceClient.from("profiles").update(patch).eq("id", request.user!.id);
    assertNoDbError(app, error, "update profile");
    return loadMe(request.user!.id, app);
  });

  // Insights screen reads the same user data.
  app.get("/insights", { preHandler: app.authenticate }, async (request) => {
    const me = await loadMe(request.user!.id, app);
    return { stats: me.stats, consistency: me.consistency };
  });

  // ── Per-user app preferences (small synced blob) ─────────────────────────
  app.get("/me/preferences", { preHandler: app.authenticate }, async (request) => {
    const { data, error } = await serviceClient
      .from("user_preferences")
      .select("data")
      .eq("user_id", request.user!.id)
      .maybeSingle();
    assertNoDbError(app, error, "load preferences");
    return { preferences: (data?.data as UserPreferences | undefined) ?? {} };
  });

  app.put("/me/preferences", { preHandler: app.authenticate }, async (request) => {
    const patch = updatePreferencesSchema.parse(request.body);
    const current = await serviceClient
      .from("user_preferences")
      .select("data")
      .eq("user_id", request.user!.id)
      .maybeSingle();
    assertNoDbError(app, current.error, "load preferences");

    const merged: UserPreferences = { ...(current.data?.data ?? {}), ...patch };
    const { error } = await serviceClient.from("user_preferences").upsert(
      { user_id: request.user!.id, data: merged, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    assertNoDbError(app, error, "save preferences");
    return { preferences: merged };
  });
};

export default meRoutes;
