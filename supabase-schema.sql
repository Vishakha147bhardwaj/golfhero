-- ============================================================
-- GolfHero Database Schema — Razorpay Edition
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null default '',
  role text not null default 'subscriber' check (role in ('subscriber','admin')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Charities ─────────────────────────────────────────────
create table if not exists charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text default '',
  image_url text,
  website_url text,
  featured boolean default false,
  active boolean default true,
  total_raised integer default 0,  -- stored in paise
  created_at timestamptz default now()
);

-- ── Subscriptions ─────────────────────────────────────────
-- NOTE: amount_paise stores amounts in paise (₹1 = 100 paise)
-- Monthly = 199900 paise = ₹1,999
-- Yearly  = 1999900 paise = ₹19,999
create table if not exists subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  plan text not null check (plan in ('monthly','yearly')),
  status text not null default 'trialing' check (status in ('active','cancelled','lapsed','trialing')),

  -- Razorpay identifiers
  razorpay_order_id text,           -- Razorpay order ID (order_xxxxxxx)
  razorpay_payment_id text unique,  -- Razorpay payment ID (pay_xxxxxxx)

  current_period_start timestamptz default now(),
  current_period_end timestamptz default (now() + interval '1 month'),
  charity_id uuid references charities(id) on delete set null,
  charity_percentage integer default 10 check (charity_percentage between 10 and 100),
  amount_paise integer not null default 199900,
  created_at timestamptz default now(),

  -- One active subscription per user
  unique (user_id)
);

-- ── Golf Scores ────────────────────────────────────────────
create table if not exists golf_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  score integer not null check (score between 1 and 45),
  score_date date not null,
  created_at timestamptz default now(),
  unique (user_id, score_date)
);

-- ── Draws ─────────────────────────────────────────────────
create table if not exists draws (
  id uuid default uuid_generate_v4() primary key,
  month text not null unique,   -- format: YYYY-MM
  status text not null default 'draft' check (status in ('draft','simulated','published')),
  draw_type text not null default 'random' check (draw_type in ('random','algorithmic')),
  winning_numbers integer[] not null default '{}',
  jackpot_amount integer default 0,   -- paise
  tier4_amount integer default 0,     -- paise
  tier3_amount integer default 0,     -- paise
  total_pool integer default 0,       -- paise
  participant_count integer default 0,
  jackpot_rollover boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ── Draw Entries ───────────────────────────────────────────
create table if not exists draw_entries (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references draws(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  scores integer[] not null default '{}',
  match_count integer default 0,
  prize_amount integer default 0,   -- paise
  created_at timestamptz default now(),
  unique (draw_id, user_id)
);

-- ── Winners ────────────────────────────────────────────────
create table if not exists winners (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references draws(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  match_type text not null check (match_type in ('5-match','4-match','3-match')),
  prize_amount integer not null default 0,   -- paise
  proof_url text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','rejected')),
  admin_notes text,
  verified_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ── RLS Policies ──────────────────────────────────────────
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table golf_scores enable row level security;
alter table charities enable row level security;
alter table draws enable row level security;
alter table draw_entries enable row level security;
alter table winners enable row level security;

-- Drop old policies if they exist (safe re-run)
do $$ begin
  drop policy if exists "Users can view own profile" on profiles;
  drop policy if exists "Users can update own profile" on profiles;
  drop policy if exists "Admins can view all profiles" on profiles;
  drop policy if exists "Admins can update all profiles" on profiles;
  drop policy if exists "Users can view own subscriptions" on subscriptions;
  drop policy if exists "Users can insert own subscriptions" on subscriptions;
  drop policy if exists "Users can update own subscriptions" on subscriptions;
  drop policy if exists "Admins full access to subscriptions" on subscriptions;
  drop policy if exists "Users can manage own scores" on golf_scores;
  drop policy if exists "Admins can view all scores" on golf_scores;
  drop policy if exists "Anyone can view active charities" on charities;
  drop policy if exists "Admins full access to charities" on charities;
  drop policy if exists "Anyone can view published draws" on draws;
  drop policy if exists "Admins full access to draws" on draws;
  drop policy if exists "Users can view own entries" on draw_entries;
  drop policy if exists "Admins full access to entries" on draw_entries;
  drop policy if exists "Users can view own wins" on winners;
  drop policy if exists "Admins full access to winners" on winners;
exception when others then null;
end $$;

-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Admins can update all profiles" on profiles for update using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Subscriptions
create policy "Users can view own subscriptions" on subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own subscriptions" on subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own subscriptions" on subscriptions for update using (auth.uid() = user_id);
create policy "Admins full access to subscriptions" on subscriptions for all using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Golf Scores
create policy "Users can manage own scores" on golf_scores for all using (auth.uid() = user_id);
create policy "Admins can view all scores" on golf_scores for select using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Charities (public read, admin write)
create policy "Anyone can view active charities" on charities for select using (active = true);
create policy "Admins full access to charities" on charities for all using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Draws (public read when published)
create policy "Anyone can view published draws" on draws for select using (status = 'published');
create policy "Admins full access to draws" on draws for all using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Draw Entries
create policy "Users can view own entries" on draw_entries for select using (auth.uid() = user_id);
create policy "Admins full access to entries" on draw_entries for all using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Winners
create policy "Users can view own wins" on winners for select using (auth.uid() = user_id);
create policy "Admins full access to winners" on winners for all using (
  exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ── Seed Charities ────────────────────────────────────────
insert into charities (name, description, website_url, featured, active) values
('Cancer Research UK', 'The world''s leading cancer charity, dedicated to saving lives through research.', 'https://www.cancerresearchuk.org', true, true),
('Mind Mental Health', 'Providing advice and support to empower anyone experiencing a mental health problem.', 'https://www.mind.org.uk', true, true),
('Golf Foundation', 'Inspiring young people to discover golf and transform their lives through the sport.', 'https://www.golf-foundation.org', true, true),
('WaterAid', 'Making clean water, decent toilets and good hygiene normal for everyone, everywhere.', 'https://www.wateraid.org', false, true),
('Macmillan Cancer Support', 'Whatever cancer throws your way, Macmillan are right there with you.', 'https://www.macmillan.org.uk', false, true),
('Age UK', 'The country''s largest charity working with and for older people.', 'https://www.ageuk.org.uk', false, true)
on conflict do nothing;

-- ── Make yourself admin (run AFTER first signup) ───────────
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';