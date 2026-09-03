-- Ask Jainam: structured deep-link from a guru's "Suggested Practice" to the
-- matching in-app guided practice screen. Nullable — free-text suggestions
-- that don't map to a screen leave it null.

alter table public.chat_messages
  add column if not exists suggested_practice text;

alter table public.ask_jainam_seed_messages
  add column if not exists suggested_practice text;
