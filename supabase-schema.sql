-- Run this once in the Supabase SQL editor.
alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload their own profile images" on storage.objects;
drop policy if exists "Users can update their own profile images" on storage.objects;
drop policy if exists "Users can delete their own profile images" on storage.objects;
drop policy if exists "Authenticated users can manage profile images" on storage.objects;
create policy "Authenticated users can manage profile images"
  on storage.objects for all to authenticated
  using (bucket_id = 'profile-images')
  with check (bucket_id = 'profile-images');

-- Allow each signed-in user to save only their own profile row.
alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.study_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_key text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, state_key)
);

alter table public.study_states enable row level security;

create policy "Users can read their own study states"
  on public.study_states for select
  using (auth.uid() = user_id);

create policy "Users can insert their own study states"
  on public.study_states for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own study states"
  on public.study_states for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_study_states_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_study_states_updated_at on public.study_states;
create trigger set_study_states_updated_at
before update on public.study_states
for each row execute function public.set_study_states_updated_at();