import type { FastifyPluginAsync } from "fastify";
import type { CalendarEvent } from "@jainam/shared";
import { serviceClient } from "../lib/supabase.js";
import { assertNoDbError } from "../lib/http.js";

const calendarRoutes: FastifyPluginAsync = async (app) => {
  // NOTE: static seed list — see REVIEW.md §4. Needs an authoritative
  // Tithi-based Jain calendar feed.
  app.get("/calendar", async () => {
    const { data, error } = await serviceClient
      .from("calendar_events")
      .select("id, title, description, event_date")
      .order("sort_order", { ascending: true });
    assertNoDbError(app, error, "load calendar events");

    const events: CalendarEvent[] = (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      date: (row.event_date as string | null) ?? undefined,
    }));
    return { events };
  });
};

export default calendarRoutes;
