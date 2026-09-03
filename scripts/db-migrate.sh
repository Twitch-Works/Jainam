#!/usr/bin/env bash
# Applies pending supabase/migrations/*.sql to a Postgres database, in order,
# tracking what ran in public.schema_migrations so it's safe to re-run.
#
# Needs a connection string in SUPABASE_DB_URL (repo-root .env) — the URI from
# Supabase dashboard → Project Settings → Database → Connection string.
# Requires `psql` on PATH.
#
#   pnpm db:migrate
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "${SUPABASE_DB_URL:-}" ] && [ -f "$ROOT/.env" ]; then
  SUPABASE_DB_URL="$(grep -E '^SUPABASE_DB_URL=' "$ROOT/.env" | head -1 | cut -d= -f2- | sed 's/^"//;s/"$//')"
fi
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "✖ SUPABASE_DB_URL is not set (repo-root .env)." >&2
  exit 1
fi
command -v psql >/dev/null || { echo "✖ psql not found on PATH." >&2; exit 1; }

psql "$SUPABASE_DB_URL" -q -c "
  create table if not exists public.schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  );"

shopt -s nullglob
pending=0
for f in "$ROOT"/supabase/migrations/*.sql; do
  v="$(basename "$f")"
  applied="$(psql "$SUPABASE_DB_URL" -tAc "select 1 from public.schema_migrations where version = '$v'")"
  if [ "$applied" = "1" ]; then
    echo "•  $v"
    continue
  fi
  echo "▸  $v"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -q -1 -f "$f"
  psql "$SUPABASE_DB_URL" -q -c "insert into public.schema_migrations (version) values ('$v')"
  pending=$((pending + 1))
done

echo "✓ up to date ($pending applied this run)"
