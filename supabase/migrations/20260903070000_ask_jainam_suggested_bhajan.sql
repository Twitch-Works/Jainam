-- Ask Jainam can suggest a specific bhajan (a devotional song) as its
-- follow-up action; the app renders it as a tile that opens
-- /bhajans/<number>. Nullable — most replies suggest a practice or nothing.

alter table public.chat_messages
  add column if not exists suggested_bhajan int;

alter table public.ask_jainam_seed_messages
  add column if not exists suggested_bhajan int;
