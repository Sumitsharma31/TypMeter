-- Reset Database (Use with caution - deletes all data)
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (links Clerk users to Supabase data)
create table profiles (
  id uuid default gen_random_uuid() primary key,
  clerk_id text unique not null,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create test_results table
create table test_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  wpm integer not null,
  accuracy numeric not null,
  consistency numeric,
  duration integer not null,
  problem_keys jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table test_results enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Service role can manage all profiles."
  on profiles for all
  using ( true );

-- Policies for test_results
create policy "Test results are viewable by everyone."
  on test_results for select
  using ( true );

create policy "Service role can manage all results."
  on test_results for all
  using ( true );
