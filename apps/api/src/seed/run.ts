/**
 * Seeds the content tables. Destructive to CONTENT only — never touches user
 * data. Idempotent: clears each table then inserts the canonical rows.
 *
 *   pnpm db:seed        (from repo root)
 *   pnpm --filter @jainam/api db:seed
 */
import { serviceClient } from "../lib/supabase.js";
import * as data from "./data.js";

type Table = string;

async function replace(table: Table, rows: Record<string, unknown>[]) {
  const del = await serviceClient.from(table).delete().not("id", "is", null);
  if (del.error) throw new Error(`clear ${table}: ${del.error.message}`);
  if (rows.length === 0) return;
  const ins = await serviceClient.from(table).insert(rows);
  if (ins.error) throw new Error(`insert ${table}: ${ins.error.message}`);
  console.log(`  ${table.padEnd(26)} ${rows.length} rows`);
}

async function main() {
  console.log("Seeding content into", process.env.SUPABASE_URL);
  await replace("sadhana_practices", data.sadhanaPractices);
  await replace("sadhana_guidance", data.sadhanaGuidance); // FK → sadhana_practices, seed after
  await replace("wisdom_thoughts", data.wisdomThoughts);
  await replace("library_categories", data.libraryCategories);
  await replace("featured_scriptures", data.featuredScriptures);
  await replace("core_beliefs", data.coreBeliefs);
  await replace("continue_reading", data.continueReading);
  await replace("calendar_events", data.calendarEvents);
  await replace("pratikraman_types", data.pratikramanTypes);
  await replace("pratikraman_steps", data.pratikramanSteps);
  await replace("six_avashyaka", data.sixAvashyaka);
  await replace("kundli_life_themes", data.kundliLifeThemes);
  await replace("kundli_guidance", data.kundliGuidance);
  await replace("ask_jainam_seed_messages", data.askJainamSeedMessages);
  await replace("meditation_sounds", data.meditationSounds);
  console.log("✓ content seeded");
}

main().catch((err) => {
  console.error("✖ seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
