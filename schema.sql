-- ============================================================
--  GROWTH APP — Supabase schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── TASKS ────────────────────────────────────────────────────
create table if not exists tasks (
  id          text        primary key,
  title       text        not null,
  done        boolean     not null default false,
  today       boolean     not null default false,
  cat         text        not null default 'General',
  created_at  timestamptz not null default now()
);

-- ── EXPENSES ─────────────────────────────────────────────────
-- Note: column is "description" (desc is a reserved SQL keyword)
create table if not exists expenses (
  id          text          primary key,
  amount      numeric(10,2) not null,
  cat         text          not null,
  description text          not null,
  date        timestamptz   not null default now(),
  created_at  timestamptz   not null default now()
);

-- ── HABITS ───────────────────────────────────────────────────
create table if not exists habits (
  id          text        primary key,
  name        text        not null,
  icon        text        not null default 'heart',
  goal        integer     not null default 1,
  current     integer     not null default 0,
  unit        text        not null default 'times',
  color       text        not null default '#0040AC',
  created_at  timestamptz not null default now()
);

-- ── NOTES ────────────────────────────────────────────────────
-- updated_at stored as bigint (JS Date.now() milliseconds)
create table if not exists notes (
  id         text    primary key,
  title      text    not null default '',
  body       text    not null default '',
  updated_at bigint  not null default (extract(epoch from now()) * 1000)::bigint
);

-- ============================================================
--  ROW LEVEL SECURITY
--  This is a personal single-user app — RLS is disabled so
--  the anon key can read/write freely.
--  When you add auth, re-enable RLS and add policies.
-- ============================================================
alter table tasks    disable row level security;
alter table expenses disable row level security;
alter table habits   disable row level security;
alter table notes    disable row level security;
