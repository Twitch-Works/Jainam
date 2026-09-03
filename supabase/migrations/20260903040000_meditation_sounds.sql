-- Ambience catalogue for the free-form Meditate session (chant / mantra /
-- ambient loops). `audio_url` null = the silent option, or audio not sourced
-- yet — the app runs a silent timer in that case.
create table public.meditation_sounds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  audio_url text,
  loop boolean not null default true,
  sort_order int not null default 0
);

alter table public.meditation_sounds enable row level security;
create policy meditation_sounds_read on public.meditation_sounds
  for select to anon, authenticated using (true);
