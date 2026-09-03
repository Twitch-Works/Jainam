-- Jainam — initial schema.
-- Content tables are world-readable (seeded via `pnpm db:seed`).
-- User tables are row-owner only; a trigger bootstraps them on signup.

create extension if not exists pgcrypto;

-- ────────────────────────────────────────────────────────────────────────────
-- CONTENT
-- ────────────────────────────────────────────────────────────────────────────

create table public.sadhana_practices (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  icon text not null,
  title text not null,
  description text not null,
  duration text not null,
  featured_on_home boolean not null default false,
  sort_order int not null default 0
);

create table public.wisdom_thoughts (
  id uuid primary key default gen_random_uuid(),
  transliteration text not null,
  translation text not null,
  source text not null,
  active boolean not null default true,
  sort_order int not null default 0
);

create table public.library_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0
);

create table public.featured_scriptures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  sort_order int not null default 0
);

create table public.core_beliefs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('essence', 'practice')),
  slug text unique not null,
  icon text not null,
  title text not null,
  description text not null,
  sort_order int not null default 0
);

create table public.continue_reading (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  chapter text not null,
  time_left text not null,
  sort_order int not null default 0
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_date date,
  sort_order int not null default 0
);

create table public.pratikraman_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  cadence text not null,
  blurb text not null,
  content_ready boolean not null default false,
  sort_order int not null default 0
);

create table public.pratikraman_steps (
  id uuid primary key default gen_random_uuid(),
  length text not null check (length in ('brief', 'complete')),
  step_no int not null,
  phase text not null,
  title text not null,
  instruction text not null,
  recitation text,
  unique (length, step_no)
);

create table public.six_avashyaka (
  id uuid primary key default gen_random_uuid(),
  num int not null unique,
  name text not null,
  gloss text not null
);

create table public.kundli_life_themes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  value text not null,
  sort_order int not null default 0
);

create table public.kundli_guidance (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('Favorable', 'Neutral', 'Challenging')),
  note text not null,
  remedy text not null,
  sort_order int not null default 0
);

create table public.ask_jainam_seed_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('user', 'guru')),
  text text not null,
  sanskrit_text text,
  sanskrit_transliteration text,
  sanskrit_translation text,
  suggested_title text,
  suggested_description text,
  sort_order int not null default 0
);

-- Content RLS: anyone may read; only the service role writes.
do $$
declare
  t text;
begin
  foreach t in array array[
    'sadhana_practices', 'wisdom_thoughts', 'library_categories', 'featured_scriptures',
    'core_beliefs', 'continue_reading', 'calendar_events', 'pratikraman_types',
    'pratikraman_steps', 'six_avashyaka', 'kundli_life_themes', 'kundli_guidance',
    'ask_jainam_seed_messages'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_read', t
    );
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- USER DATA
-- ────────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  phone text,
  name text not null default '',
  role text not null default 'Seeker on the path of liberation',
  sadhak_level text not null default 'Shravak',
  xp int not null default 0,
  xp_to_next int not null default 2000,
  vows text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  meditation_minutes int not null default 0,
  pratikraman_sessions int not null default 0,
  ahimsa_score int not null default 0,
  longest_meditation int not null default 0,
  total_pratikraman_steps int not null default 0,
  mantras_chanted int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.user_consistency (
  user_id uuid references public.profiles (id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  value numeric not null default 0 check (value between 0 and 1),
  primary key (user_id, weekday)
);

create table public.user_pratikraman_progress (
  user_id uuid references public.profiles (id) on delete cascade,
  type_slug text not null,
  length text not null check (length in ('brief', 'complete')),
  completed_steps int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, type_slug, length)
);

create table public.user_pratikraman_goal (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  goal text not null,
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'guru')),
  text text not null,
  sanskrit_text text,
  sanskrit_transliteration text,
  sanskrit_translation text,
  suggested_title text,
  suggested_description text,
  created_at timestamptz not null default now()
);
create index chat_messages_user_created_idx on public.chat_messages (user_id, created_at);

alter table public.profiles enable row level security;
create policy profiles_select on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy profiles_update on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare
  t text;
begin
  foreach t in array array[
    'user_stats', 'user_consistency', 'user_pratikraman_progress',
    'user_pratikraman_goal', 'chat_messages'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)',
      t || '_select', t
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)',
      t || '_insert', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_update', t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)',
      t || '_delete', t
    );
  end loop;
end $$;

-- ────────────────────────────────────────────────────────────────────────────
-- New-user bootstrap
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Seeker'
    )
  );
  insert into public.user_stats (user_id) values (new.id);
  insert into public.user_consistency (user_id, weekday, value)
  select new.id, gs, 0 from generate_series(0, 6) as gs;
  insert into public.user_pratikraman_goal (user_id, goal)
  values (new.id, 'Complete Pratikraman calmly, without rushing, every evening.');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
