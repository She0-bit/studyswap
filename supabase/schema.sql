-- ============================================================
-- StudySwap Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Profiles (one per auth user) ────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null default '',
  institution text not null default '',
  specialty   text not null default '',
  points      integer not null default 0,
  created_at  timestamptz default now()
);

-- ── Forms ────────────────────────────────────────────────────
create table if not exists forms (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references profiles(id) on delete cascade not null,
  title             text not null,
  description       text not null,
  link              text not null,
  institution       text not null default '',
  specialty         text not null default '',
  estimated_minutes integer not null default 5,
  fill_count        integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz default now()
);

-- ── Fills ────────────────────────────────────────────────────
create table if not exists fills (
  id        uuid default uuid_generate_v4() primary key,
  user_id   uuid references profiles(id) on delete cascade not null,
  form_id   uuid references forms(id) on delete cascade not null,
  filled_at timestamptz default now(),
  unique(user_id, form_id)
);

-- ── Row Level Security ───────────────────────────────────────
alter table profiles enable row level security;
alter table forms     enable row level security;
alter table fills     enable row level security;

-- profiles
create policy "profiles_select_all"   on profiles for select using (true);
create policy "profiles_insert_own"   on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"   on profiles for update using (auth.uid() = id);

-- forms
create policy "forms_select_active"   on forms for select using (is_active = true);
create policy "forms_insert_own"      on forms for insert with check (auth.uid() = user_id);
create policy "forms_update_own"      on forms for update using (auth.uid() = user_id);

-- fills
create policy "fills_select_own"      on fills for select using (auth.uid() = user_id);
create policy "fills_insert_own"      on fills for insert with check (auth.uid() = user_id);

-- ── Auto-create profile on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── fill_form RPC: atomic fill + points award ────────────────
create or replace function public.fill_form(form_id_input uuid)
returns jsonb as $$
declare
  v_user_id     uuid := auth.uid();
  v_form_owner  uuid;
  v_est_minutes integer;
  v_points      integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select user_id, estimated_minutes
  into   v_form_owner, v_est_minutes
  from   forms
  where  id = form_id_input and is_active = true;

  if not found then
    raise exception 'Form not found';
  end if;

  if v_form_owner = v_user_id then
    raise exception 'You cannot fill your own form';
  end if;

  -- Points: 10 base + 2 per estimated minute
  v_points := 10 + (v_est_minutes * 2);

  -- Record the fill (unique constraint prevents duplicates)
  insert into fills (user_id, form_id) values (v_user_id, form_id_input);

  -- Award points to the filler
  update profiles set points = points + v_points where id = v_user_id;

  -- Increment fill count on the form
  update forms set fill_count = fill_count + 1 where id = form_id_input;

  return jsonb_build_object('points_earned', v_points);
end;
$$ language plpgsql security definer;

-- ── View: feed (forms joined with submitter profile) ─────────
create or replace view public.forms_feed as
select
  f.id,
  f.title,
  f.description,
  f.link,
  f.institution,
  f.specialty,
  f.estimated_minutes,
  f.fill_count,
  f.created_at,
  f.user_id,
  p.name        as submitter_name,
  p.institution as submitter_institution,
  p.points      as submitter_points
from forms f
join profiles p on p.id = f.user_id
where f.is_active = true
order by p.points desc, f.created_at desc;
