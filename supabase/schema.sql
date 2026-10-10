-- Enable required extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'farmer' check (role in ('farmer','officer')),
  village text,
  district text,
  state text default 'Uttar Pradesh',
  language text not null default 'hi' check (language in ('hi','en')),
  location geography(Point,4326),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, village, district, state, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'role','farmer'),
    coalesce(new.raw_user_meta_data->>'village','Lucknow'),
    coalesce(new.raw_user_meta_data->>'district','Lucknow'),
    coalesce(new.raw_user_meta_data->>'state','Uttar Pradesh'),
    coalesce(new.raw_user_meta_data->>'language','hi')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_officer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'officer');
$$;

-- 2. Crop reports
create table if not exists public.crop_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_path text not null,                 -- path in storage bucket crop-images
  user_note text,                           -- spoken or typed description
  crop_key text,                            -- normalized, e.g. 'wheat'
  disease_key text,                         -- normalized, e.g. 'leaf_rust'; null if healthy/unknown
  is_healthy boolean not null default false,
  confidence numeric(3,2),                  -- 0.00 to 1.00
  severity text check (severity in ('low','medium','high')),
  diagnosis jsonb not null,                 -- full structured AI output (Section 8)
  geom geography(Point,4326),
  village text,
  created_at timestamptz not null default now()
);

create index if not exists crop_reports_geom_idx on public.crop_reports using gist (geom);
create index if not exists crop_reports_recent_idx on public.crop_reports (created_at desc);
create index if not exists crop_reports_key_idx on public.crop_reports (crop_key, disease_key);

-- 3. Officer actions on outbreaks (cluster identity is derived; stores human decision)
create table if not exists public.outbreak_reviews (
  id uuid primary key default gen_random_uuid(),
  cluster_key text not null unique,         -- e.g. crop_key|disease_key|rounded_lat|rounded_lng
  status text not null default 'open' check (status in ('open','verified','resolved')),
  officer_id uuid references public.profiles(id),
  note text,
  updated_at timestamptz not null default now()
);

-- 4. Mandi cache
create table if not exists public.mandi_cache (
  cache_key text primary key,               -- e.g. 'UP|Lucknow|Wheat'
  payload jsonb not null,
  fetched_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.crop_reports enable row level security;
alter table public.outbreak_reviews enable row level security;
alter table public.mandi_cache enable row level security;

-- Profiles policies
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_officer());

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Crop reports policies
drop policy if exists "own reports read" on public.crop_reports;
create policy "own reports read" on public.crop_reports for select using (user_id = auth.uid() or public.is_officer());

drop policy if exists "own reports insert" on public.crop_reports;
create policy "own reports insert" on public.crop_reports for insert with check (user_id = auth.uid());

-- Outbreak reviews policies
drop policy if exists "officer manages reviews" on public.outbreak_reviews;
create policy "officer manages reviews" on public.outbreak_reviews for all using (public.is_officer()) with check (public.is_officer());

drop policy if exists "anyone signed in reads reviews" on public.outbreak_reviews;
create policy "anyone signed in reads reviews" on public.outbreak_reviews for select using (auth.uid() is not null);

-- Outbreak detection: clusters recent unhealthy reports of the same crop+disease within a radius.
-- Uses UTM zone 44N (EPSG:32644), which suits Lucknow, so metres are accurate.
-- SECURITY DEFINER lets farmers see aggregate alerts without reading other farmers' reports.
create or replace function public.detect_outbreaks(
  radius_m int default 5000,
  window_days int default 7,
  min_farmers int default 3
)
returns table (
  cluster_key text,
  crop_key text,
  disease_key text,
  report_count bigint,
  farmer_count bigint,
  center_lat double precision,
  center_lng double precision,
  latest_report timestamptz
)
language sql stable security definer set search_path = public as $$
  with recent as (
    select id, user_id, crop_key, disease_key, geom::geometry as g, created_at,
           ST_ClusterDBSCAN(ST_Transform(geom::geometry, 32644), eps := radius_m, minpoints := 1)
             over (partition by crop_key, disease_key) as cid
    from crop_reports
    where created_at > now() - make_interval(days => window_days)
      and is_healthy = false
      and disease_key is not null
      and geom is not null
  )
  select
    crop_key || '|' || disease_key || '|' || cid as cluster_key,
    crop_key, disease_key,
    count(*) as report_count,
    count(distinct user_id) as farmer_count,
    ST_Y(ST_Centroid(ST_Collect(g))) as center_lat,
    ST_X(ST_Centroid(ST_Collect(g))) as center_lng,
    max(created_at) as latest_report
  from recent
  group by crop_key, disease_key, cid
  having count(distinct user_id) >= min_farmers;
$$;
