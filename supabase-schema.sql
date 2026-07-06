-- ============================================
-- ResumePilot Database Schema
-- Run this in the SQL Editor of your NEW Supabase project
-- ============================================

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null default '',
  name text not null default '',
  phone text not null unique,
  role text not null default '',
  experience text not null default '',
  location text not null default '',
  linkedin text not null default '',
  skills text[] not null default '{}',
  -- Full resume + extracted details so a returning user is fully restored on login
  resume_text text not null default '',
  summary text not null default '',
  education text not null default '',
  key_achievements text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent migration: safe to re-run on an existing profiles table that
-- pre-dates the resume/details columns.
alter table public.profiles add column if not exists resume_text text not null default '';
alter table public.profiles add column if not exists summary text not null default '';
alter table public.profiles add column if not exists education text not null default '';
alter table public.profiles add column if not exists key_achievements text[] not null default '{}';

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_title text not null default '',
  company text not null default '',
  final_score integer not null default 0,
  job_description text not null default '',
  resume_text text not null default '',
  result jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

-- NOTE: there is no Supabase Auth session in this app (sign-in is a plain
-- phone-number lookup), so there is no auth.uid() to scope rows by.
-- These policies allow the anon key full access to both tables.
create policy "Anyone can view profiles" on public.profiles
  for select using (true);

create policy "Anyone can insert profiles" on public.profiles
  for insert with check (true);

create policy "Anyone can update profiles" on public.profiles
  for update using (true);

create policy "Anyone can view analyses" on public.analyses
  for select using (true);

create policy "Anyone can insert analyses" on public.analyses
  for insert with check (true);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
