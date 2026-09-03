-- Bhajans — devotional songs the user can read and play as an audio
-- meditation. Lyrics live here; the audio files live in the private
-- `bhajans` Storage bucket and are served to the app as short-lived signed
-- URLs minted by GET /api/bhajans/:number. `audio_path` is the object key in
-- that bucket (e.g. "01.mp3"); null until the file is uploaded.
create table if not exists public.bhajans (
  id uuid primary key default gen_random_uuid(),
  number int unique not null,
  title text,
  tune text not null,
  lyrics_lines jsonb not null default '[]'::jsonb,
  audio_path text,
  needs_review boolean not null default false,
  review_notes text,
  sort_order int not null default 0
);

alter table public.bhajans enable row level security;

drop policy if exists bhajans_read on public.bhajans;
create policy bhajans_read on public.bhajans
  for select to anon, authenticated using (true);
