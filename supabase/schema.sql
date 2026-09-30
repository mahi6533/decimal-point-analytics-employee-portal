-- Decimal Point Analytics Employee Portal
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_code text unique,
  full_name text not null,
  email text unique,
  department text,
  job_title text,
  location text,
  role text not null default 'employee'
    check (role in ('super_admin','hr_admin','project_manager','team_lead','employee')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  status text not null default 'planning',
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  title text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'todo' check (status in ('todo','in_progress','completed','blocked')),
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  attendance_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text not null default 'present' check (status in ('present','leave','absent','half_day')),
  created_at timestamptz not null default now(),
  unique(employee_id, attendance_date)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all',
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.announcements enable row level security;

-- Authenticated employees can read the portal's shared workspace data.
create policy "authenticated users can read profiles"
on public.profiles for select to authenticated using (true);

create policy "authenticated users can read projects"
on public.projects for select to authenticated using (true);

create policy "authenticated users can read tasks"
on public.tasks for select to authenticated using (true);

create policy "employees can read their attendance"
on public.attendance for select to authenticated
using (employee_id = auth.uid());

create policy "employees can insert their attendance"
on public.attendance for insert to authenticated
with check (employee_id = auth.uid());

create policy "employees can update their attendance"
on public.attendance for update to authenticated
using (employee_id = auth.uid())
with check (employee_id = auth.uid());

create policy "employees can read their leave requests"
on public.leave_requests for select to authenticated
using (employee_id = auth.uid());

create policy "employees can create their leave requests"
on public.leave_requests for insert to authenticated
with check (employee_id = auth.uid());

create policy "authenticated users can read announcements"
on public.announcements for select to authenticated using (true);

-- Create a profile automatically when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
