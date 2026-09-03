-- Per-user app preferences (last-chosen Pratikramaṇa type/length, etc.).
-- A single jsonb blob so new keys don't need a migration; created lazily on
-- first write, defaults to {} on read.

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;
create policy user_preferences_select on public.user_preferences
  for select to authenticated using (auth.uid() = user_id);
create policy user_preferences_insert on public.user_preferences
  for insert to authenticated with check (auth.uid() = user_id);
create policy user_preferences_update on public.user_preferences
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
