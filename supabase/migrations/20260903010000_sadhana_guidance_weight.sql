-- Give each guidance cue card a relative weight so a session can spend more
-- time on the core practice than on settling in / concluding.
alter table public.sadhana_guidance
  add column if not exists weight int not null default 1;
