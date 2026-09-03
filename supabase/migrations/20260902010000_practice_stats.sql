-- Practice sessions → stats write path.
-- A session log table, columns on sadhana_practices to describe a loggable
-- session, and one atomic function that updates stats / consistency / XP.

-- ── sadhana_practices: how tapping a row logs a session ─────────────────────
alter table public.sadhana_practices
  add column if not exists session_kind text check (session_kind in ('meditation', 'pratikraman', 'chant')),
  add column if not exists session_minutes int not null default 0,
  add column if not exists session_mantras int not null default 0;

-- ── practice_sessions: append-only audit log ───────────────────────────────
create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('meditation', 'pratikraman', 'chant')),
  minutes int not null default 0,
  steps int not null default 0,
  mantras int not null default 0,
  created_at timestamptz not null default now()
);
create index practice_sessions_user_created_idx
  on public.practice_sessions (user_id, created_at desc);

alter table public.practice_sessions enable row level security;
create policy practice_sessions_select on public.practice_sessions
  for select to authenticated using (auth.uid() = user_id);
create policy practice_sessions_insert on public.practice_sessions
  for insert to authenticated with check (auth.uid() = user_id);

-- ── record_practice_session: the single write path for stats ───────────────
-- Called by the API with the service role, so the user id is passed in.
create or replace function public.record_practice_session(
  p_user uuid,
  p_kind text,
  p_minutes int,
  p_steps int,
  p_mantras int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_levels     text[] := array['Shravak', 'Vratdhārī', 'Sādhak', 'Tapasvī', 'Shraman'];
  v_thresholds int[]  := array[2000, 5000, 12000, 30000, 2147483647];
  v_weekday    int    := (extract(isodow from now())::int) - 1;  -- Mon=0 … Sun=6
  v_xp_award   int;
  v_idx        int;
  v_xp         int;
  v_to_next    int;
  v_level      text;
  v_leveled    boolean := false;
  v_score      int;
begin
  if p_kind not in ('meditation', 'pratikraman', 'chant') then
    raise exception 'invalid practice kind: %', p_kind;
  end if;

  insert into public.practice_sessions (user_id, kind, minutes, steps, mantras)
  values (p_user, p_kind, greatest(p_minutes, 0), greatest(p_steps, 0), greatest(p_mantras, 0));

  update public.user_stats
     set meditation_minutes      = meditation_minutes + greatest(p_minutes, 0),
         longest_meditation      = greatest(longest_meditation, greatest(p_minutes, 0)),
         pratikraman_sessions    = pratikraman_sessions + (case when p_kind = 'pratikraman' then 1 else 0 end),
         total_pratikraman_steps = total_pratikraman_steps + greatest(p_steps, 0),
         mantras_chanted         = mantras_chanted + greatest(p_mantras, 0),
         updated_at              = now()
   where user_id = p_user;

  -- Nudge today's consistency bar toward full.
  update public.user_consistency
     set value = least(1, value + 0.34)
   where user_id = p_user and weekday = v_weekday;

  -- Recompute the Ahimsa Score as the 7-day consistency average (placeholder
  -- metric — see REVIEW.md §7).
  select round(avg(value) * 100)::int into v_score
    from public.user_consistency where user_id = p_user;
  update public.user_stats
     set ahimsa_score = coalesce(v_score, 0)
   where user_id = p_user;

  -- Award XP and advance the sādhak level if thresholds are crossed.
  v_xp_award := greatest(
    5,
    greatest(p_minutes, 0)
      + greatest(p_steps, 0) / 2
      + greatest(p_mantras, 0) / 27
      + (case when p_kind = 'pratikraman' then 20 else 0 end)
  );

  select xp + v_xp_award, xp_to_next, sadhak_level
    into v_xp, v_to_next, v_level
    from public.profiles where id = p_user
    for update;

  v_idx := coalesce(array_position(v_levels, v_level), 1) - 1;  -- 0-based
  while v_xp >= v_to_next and v_idx < array_length(v_levels, 1) - 1 loop
    v_xp      := v_xp - v_to_next;
    v_idx     := v_idx + 1;
    v_level   := v_levels[v_idx + 1];
    v_to_next := v_thresholds[v_idx + 1];
    v_leveled := true;
  end loop;

  update public.profiles
     set xp = v_xp, xp_to_next = v_to_next, sadhak_level = v_level, updated_at = now()
   where id = p_user;

  return jsonb_build_object(
    'ok', true,
    'xpAwarded', v_xp_award,
    'leveledUp', v_leveled,
    'level', v_level
  );
end $$;

revoke all on function public.record_practice_session(uuid, text, int, int, int) from public;
grant execute on function public.record_practice_session(uuid, text, int, int, int) to service_role;
