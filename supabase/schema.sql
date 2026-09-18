-- Выполните в Supabase: SQL Editor → New query → Run

create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null,
  updated_at bigint not null default 0
);

alter table public.app_state enable row level security;

drop policy if exists "family_read_write" on public.app_state;
create policy "family_read_write"
  on public.app_state
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Realtime: Database → Publications → supabase_realtime → включите таблицу app_state
-- или выполните (если ещё не добавлена):
-- alter publication supabase_realtime add table public.app_state;
