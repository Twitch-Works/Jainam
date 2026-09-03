-- Guided-session content for the Sadhana practices:
--   • meditation practices (Samayik, Khāyotsarga, Anupreksha) → timed player
--     with a sequence of contemplation cue cards
--   • Japa / Chanting → a mala counter with the mantra text
-- (Pratikramaṇa keeps its own step player.)

alter table public.sadhana_practices
  add column if not exists mantra_text text,
  add column if not exists mantra_transliteration text,
  add column if not exists mantra_translation text;

create table if not exists public.sadhana_guidance (
  id uuid primary key default gen_random_uuid(),
  practice_slug text not null references public.sadhana_practices (slug) on delete cascade,
  step_no int not null,
  heading text not null,
  body text not null,
  unique (practice_slug, step_no)
);
create index if not exists sadhana_guidance_practice_idx
  on public.sadhana_guidance (practice_slug, step_no);

alter table public.sadhana_guidance enable row level security;
drop policy if exists sadhana_guidance_read on public.sadhana_guidance;
create policy sadhana_guidance_read on public.sadhana_guidance
  for select to anon, authenticated using (true);
