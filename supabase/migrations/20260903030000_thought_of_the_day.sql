-- Thought of the Day rotates daily through the active pool (by sort_order).
-- An optional for_date pins a specific thought to a calendar day (e.g. a
-- festival), overriding the rotation.
alter table public.wisdom_thoughts
  add column if not exists for_date date;

create unique index if not exists wisdom_thoughts_for_date_idx
  on public.wisdom_thoughts (for_date)
  where for_date is not null;
