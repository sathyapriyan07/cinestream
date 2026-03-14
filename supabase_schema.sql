-- ============================================================
-- CineStream — Full Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- ── 1. user_profiles ────────────────────────────────────────
create table if not exists user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  active     boolean not null default true,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, email, role, active)
  values (new.id, new.email, 'user', true)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── 2. movies ───────────────────────────────────────────────
create table if not exists movies (
  id           uuid default gen_random_uuid() primary key,
  tmdb_id      integer unique,
  title        text not null,
  description  text,
  poster_url   text,
  backdrop_url text,
  title_logo_url text,
  release_date date,
  runtime      integer,
  genres       text[] default '{}',
  vote_average numeric default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── 3. series ───────────────────────────────────────────────
create table if not exists series (
  id             uuid default gen_random_uuid() primary key,
  tmdb_id        integer unique,
  title          text not null,
  description    text,
  poster_url     text,
  backdrop_url   text,
  title_logo_url text,
  first_air_date date,
  seasons_count  integer,
  vote_average   numeric default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── 4. hero_banners ─────────────────────────────────────────
-- Drop and recreate with full columns
drop table if exists hero_banners cascade;
create table hero_banners (
  id            uuid default gen_random_uuid() primary key,
  tmdb_id       integer,
  media_type    text not null default 'movie' check (media_type in ('movie', 'tv')),
  title         text,
  backdrop_url  text,
  display_order integer default 0,
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 5. watchlist ────────────────────────────────────────────
create table if not exists watchlist (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  tmdb_id     integer not null,
  media_type  text not null check (media_type in ('movie', 'tv')),
  title       text,
  poster_path text,
  created_at  timestamptz default now(),
  unique(user_id, tmdb_id, media_type)
);

-- ── 6. continue_watching ────────────────────────────────────
create table if not exists continue_watching (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  tmdb_id     integer not null,
  media_type  text not null check (media_type in ('movie', 'tv')),
  title       text,
  poster_path text,
  season      integer,
  episode     integer,
  timestamp   integer default 0,
  duration    integer default 0,
  progress    integer default 0,
  updated_at  timestamptz default now(),
  unique(user_id, tmdb_id, media_type)
);

-- ── updated_at triggers ─────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists movies_updated_at   on movies;
drop trigger if exists series_updated_at   on series;
drop trigger if exists banners_updated_at  on hero_banners;

create trigger movies_updated_at
  before update on movies
  for each row execute procedure set_updated_at();

create trigger series_updated_at
  before update on series
  for each row execute procedure set_updated_at();

create trigger banners_updated_at
  before update on hero_banners
  for each row execute procedure set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table user_profiles   enable row level security;
alter table movies          enable row level security;
alter table series          enable row level security;
alter table hero_banners    enable row level security;
alter table watchlist       enable row level security;
alter table continue_watching enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── user_profiles policies ──────────────────────────────────
drop policy if exists "Users read own profile"   on user_profiles;
drop policy if exists "Admins read all profiles" on user_profiles;
drop policy if exists "Admins update profiles"   on user_profiles;

create policy "Users read own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Admins read all profiles"
  on user_profiles for select
  using (is_admin());

create policy "Admins update profiles"
  on user_profiles for update
  using (is_admin())
  with check (is_admin());

-- ── movies policies ─────────────────────────────────────────
drop policy if exists "Anyone can read movies"  on movies;
drop policy if exists "Admins manage movies"    on movies;

create policy "Anyone can read movies"
  on movies for select using (true);

create policy "Admins insert movies"
  on movies for insert
  with check (is_admin());

create policy "Admins update movies"
  on movies for update
  using (is_admin()) with check (is_admin());

create policy "Admins delete movies"
  on movies for delete
  using (is_admin());

-- ── series policies ─────────────────────────────────────────
drop policy if exists "Anyone can read series" on series;
drop policy if exists "Admins manage series"   on series;

create policy "Anyone can read series"
  on series for select using (true);

create policy "Admins insert series"
  on series for insert
  with check (is_admin());

create policy "Admins update series"
  on series for update
  using (is_admin()) with check (is_admin());

create policy "Admins delete series"
  on series for delete
  using (is_admin());

-- ── hero_banners policies ───────────────────────────────────
drop policy if exists "Anyone can read hero_banners" on hero_banners;
drop policy if exists "Admins manage hero_banners"   on hero_banners;

create policy "Anyone can read hero_banners"
  on hero_banners for select using (true);

create policy "Admins insert banners"
  on hero_banners for insert
  with check (is_admin());

create policy "Admins update banners"
  on hero_banners for update
  using (is_admin()) with check (is_admin());

create policy "Admins delete banners"
  on hero_banners for delete
  using (is_admin());

-- ── watchlist policies ──────────────────────────────────────
drop policy if exists "Users manage own watchlist" on watchlist;

create policy "Users manage own watchlist"
  on watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── continue_watching policies ──────────────────────────────
drop policy if exists "Users manage own continue_watching" on continue_watching;

create policy "Users manage own continue_watching"
  on continue_watching for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Seed: promote your first admin manually
-- Replace the email below with your admin account email
-- ============================================================
-- update user_profiles set role = 'admin' where email = 'your@email.com';

-- ============================================================
-- Migration: add title_logo_url to movies and series
-- Run this if you already applied the schema above
-- ============================================================
alter table movies add column if not exists title_logo_url text;
alter table series add column if not exists title_logo_url text;
