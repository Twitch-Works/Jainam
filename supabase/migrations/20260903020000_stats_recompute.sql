-- Make the Insights numbers reflect real activity:
--   • Consistency bars are rebuilt from the practice_sessions log each time
--     (min(1, sessions_that_day / 3)) instead of a stored +0.34 drift.
--   • Ahimsa Score = % of recent days on which the user practised
--     (window grows to 7 days as the account ages), not a consistency average.
-- Both live in recompute_user_progress(), called by record_practice_session().

create or replace function public.recompute_user_progress(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today_w    int := (extract(isodow from now())::int) - 1;  -- 0 = Mon … 6 = Sun
  d            int;
  v_date       date;
  v_count      int;
  v_days       int;
  v_window     int;
  v_score      int;
begin
  -- This week's consistency (Mon..Sun), counted from the session log.
  for d in 0..6 loop
    v_date := (now()::date) - (v_today_w - d);
    select count(*) into v_count
      from public.practice_sessions
      where user_id = p_user
        and ((created_at at time zone 'utc')::date) = v_date;
    update public.user_consistency
       set value = least(1, v_count::numeric / 3)
     where user_id = p_user and weekday = d;
  end loop;

  -- Ahimsa Score: distinct days practised in the last 7, over the days the
  -- account could have practised (min of 7 and account age in days).
  select count(distinct ((created_at at time zone 'utc')::date))
    into v_days
    from public.practice_sessions
    where user_id = p_user and created_at >= now() - interval '7 days';

  select greatest(1, least(7, ((now()::date) - min((created_at at time zone 'utc')::date)) + 1))
    into v_window
    from public.practice_sessions where user_id = p_user;

  v_score := least(100, round(100.0 * coalesce(v_days, 0) / coalesce(v_window, 1)));
  update public.user_stats set ahimsa_score = v_score where user_id = p_user;
end $$;

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
  v_xp_award   int;
  v_idx        int;
  v_xp         int;
  v_to_next    int;
  v_level      text;
  v_leveled    boolean := false;
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

  perform public.recompute_user_progress(p_user);

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

  v_idx := coalesce(array_position(v_levels, v_level), 1) - 1;
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
    'ok', true, 'xpAwarded', v_xp_award, 'leveledUp', v_leveled, 'level', v_level
  );
end $$;

revoke all on function public.record_practice_session(uuid, text, int, int, int) from public;
grant execute on function public.record_practice_session(uuid, text, int, int, int) to service_role;

-- Backfill: recompute for everyone who already has data.
do $$
declare u uuid;
begin
  for u in select id from public.profiles loop
    perform public.recompute_user_progress(u);
  end loop;
end $$;
