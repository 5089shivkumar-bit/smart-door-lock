-- Enable pgvector extension to work with face embeddings
create extension if not exists vector;

-- Employees Table
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('admin', 'employee')),
  face_embedding vector(128),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Access Logs Table
create table public.access_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id),
  status text not null check (status in ('success', 'failed')),
  confidence float,
  device_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.employees enable row level security;
alter table public.access_logs enable row level security;

-- Policies (Assuming a service_role or specific authenticated device user)
-- For demonstration/prototype, we allow anonymous read for employees (so the device can fetch them without complex auth flow yet)
-- In production, this should be restricted to authenticated 'device' role.

create policy "Allow read access to employees" on public.employees
  for select using (true);

create policy "Allow insert access to logs" on public.access_logs
  for insert with check (true);

create policy "Allow read access to logs" on public.access_logs
  for select using (true);
