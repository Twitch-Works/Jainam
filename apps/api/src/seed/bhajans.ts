/**
 * Uploads the bhajans to Supabase — lyrics into `public.bhajans`, audio into
 * the private `bhajans` Storage bucket. Source files live at the repo root:
 *
 *   assets/bhajans.json        (lyrics + metadata)
 *   assets/audio/NN.mp3        (one per bhajan `number`, zero-padded)
 *
 * Idempotent — re-run any time after editing the source files:
 *
 *   pnpm db:bhajans            (from repo root)
 *
 * The app never bundles these files; it fetches them via /api/bhajans*.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serviceClient } from "../lib/supabase.js";

const BUCKET = "bhajans";

// dist/seed/bhajans.js → repo root is four levels up (apps/api/dist/seed).
const repoRoot =
  process.env.BHAJANS_ASSETS_ROOT ??
  resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const assetsDir = resolve(repoRoot, "assets");
const audioDir = resolve(assetsDir, "audio");

type RawLine = { text: string; startMs: number | null; endMs: number | null };
type RawBhajan = {
  number: number;
  tune: string;
  title: string | null;
  needsReview?: boolean;
  reviewNotes?: string | null;
  lyricsLines: RawLine[];
};

async function ensureBucket() {
  const { data: existing } = await serviceClient.storage.getBucket(BUCKET);
  if (existing) return;
  const { error } = await serviceClient.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: "20MB",
    allowedMimeTypes: ["audio/mpeg"],
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`create bucket ${BUCKET}: ${error.message}`);
  }
  console.log(`  created private bucket "${BUCKET}"`);
}

async function uploadAudio(number: number): Promise<string | null> {
  const name = `${String(number).padStart(2, "0")}.mp3`;
  const path = resolve(audioDir, name);
  if (!existsSync(path)) {
    console.warn(`  ⚠️  ${name} not found — bhajan ${number} will have no audio`);
    return null;
  }
  const { error } = await serviceClient.storage
    .from(BUCKET)
    .upload(name, readFileSync(path), { contentType: "audio/mpeg", upsert: true });
  if (error) throw new Error(`upload ${name}: ${error.message}`);
  return name;
}

async function main() {
  console.log("Uploading bhajans to", process.env.SUPABASE_URL);
  const raw = JSON.parse(readFileSync(resolve(assetsDir, "bhajans.json"), "utf8")) as RawBhajan[];

  await ensureBucket();

  const rows = [];
  for (const b of raw) {
    const audioPath = await uploadAudio(b.number);
    rows.push({
      number: b.number,
      title: b.title,
      tune: b.tune,
      lyrics_lines: b.lyricsLines,
      audio_path: audioPath,
      needs_review: b.needsReview ?? false,
      review_notes: b.reviewNotes ?? null,
      sort_order: b.number,
    });
  }

  const { error } = await serviceClient.from("bhajans").upsert(rows, { onConflict: "number" });
  if (error) throw new Error(`upsert bhajans: ${error.message}`);

  console.log(`✓ ${rows.length} bhajans uploaded (${rows.filter((r) => r.audio_path).length} with audio)`);
}

main().catch((err) => {
  console.error("✖ bhajan upload failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
