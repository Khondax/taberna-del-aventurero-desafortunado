-- Esquema inicial para Supabase. Aplicar en un proyecto nuevo de Supabase.
create extension if not exists "pgcrypto";

create table public.tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create type public.table_role as enum ('owner', 'director');
create table public.table_members (
  table_id uuid not null references public.tables(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.table_role not null default 'director',
  created_at timestamptz not null default now(),
  primary key (table_id, user_id)
);

create table public.table_invites (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete cascade,
  email text not null,
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text,
  background text,
  class_name text,
  subclass text,
  level integer not null default 1 check (level between 1 and 20),
  sheet jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.character_events (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.rule_entries (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete cascade,
  category text not null,
  name text not null,
  summary text not null default '',
  details text not null default '',
  source text not null default 'casero',
  is_custom boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.director_notes (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  director_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_table_member(target_table uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.table_members where table_id = target_table and user_id = auth.uid())
    or exists (select 1 from public.tables where id = target_table and owner_id = auth.uid());
$$;

alter table public.tables enable row level security;
alter table public.table_members enable row level security;
alter table public.table_invites enable row level security;
alter table public.characters enable row level security;
alter table public.character_events enable row level security;
alter table public.rule_entries enable row level security;
alter table public.director_notes enable row level security;

create policy "members can view tables" on public.tables for select using (public.is_table_member(id));
create policy "owners manage tables" on public.tables for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members can view membership" on public.table_members for select using (public.is_table_member(table_id));
create policy "owners manage membership" on public.table_members for all using (exists (select 1 from public.tables where id = table_id and owner_id = auth.uid()));
create policy "owners manage invites" on public.table_invites for all using (exists (select 1 from public.tables where id = table_id and owner_id = auth.uid()));
create policy "members view characters" on public.characters for select using (public.is_table_member(table_id));
create policy "owners edit own characters" on public.characters for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members view events" on public.character_events for select using (exists (select 1 from public.characters c where c.id = character_id and public.is_table_member(c.table_id)));
create policy "owners create events" on public.character_events for insert with check (actor_id = auth.uid() and exists (select 1 from public.characters c where c.id = character_id and c.owner_id = auth.uid()));
create policy "members view rules" on public.rule_entries for select using (public.is_table_member(table_id));
create policy "owners and directors edit rules" on public.rule_entries for all using (exists (select 1 from public.tables t left join public.table_members m on m.table_id = t.id and m.user_id = auth.uid() where t.id = table_id and (t.owner_id = auth.uid() or m.role = 'director')));
create policy "directors view own notes" on public.director_notes for select using (director_id = auth.uid());
create policy "directors manage notes" on public.director_notes for all using (director_id = auth.uid()) with check (director_id = auth.uid());
