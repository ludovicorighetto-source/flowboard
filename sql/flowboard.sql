create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'task_priority'
  ) then
    create type public.task_priority as enum ('low', 'medium', 'high');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  is_approved boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_approved_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_approved = true
  );
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
      and is_approved = true
  );
$$;

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  list_id uuid not null references public.lists(id) on delete cascade,
  position integer not null default 0,
  priority public.task_priority not null default 'medium',
  start_date date,
  due_date date,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_due_after_start check (
    start_date is null
    or due_date is null
    or due_date >= start_date
  )
);

create table if not exists public.task_labels (
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

create table if not exists public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (task_id, user_id)
);

create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  text text not null,
  is_done boolean not null default false,
  position integer not null default 0
);

create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  type text not null check (type in ('file', 'link')),
  name text not null,
  url text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.roadmap_phases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  color text not null default '#0071e3',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.roadmap_goals (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references public.roadmap_phases(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.goal_tasks (
  goal_id uuid not null references public.roadmap_goals(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  primary key (goal_id, task_id)
);

create index if not exists idx_lists_position on public.lists(position);
create index if not exists idx_tasks_list_id on public.tasks(list_id);
create index if not exists idx_tasks_position on public.tasks(position);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_start_date on public.tasks(start_date);
create index if not exists idx_checklists_task_id on public.checklists(task_id);
create index if not exists idx_checklist_items_checklist_id on public.checklist_items(checklist_id);
create index if not exists idx_task_attachments_task_id on public.task_attachments(task_id);
create index if not exists idx_roadmap_goals_phase_id on public.roadmap_goals(phase_id);
create index if not exists idx_goal_tasks_task_id on public.goal_tasks(task_id);

create or replace function public.set_task_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_task_updated_at on public.tasks;
create trigger set_task_updated_at
before update on public.tasks
for each row
execute procedure public.set_task_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    is_approved,
    is_admin
  )
  values (
    new.id,
    lower(new.email),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case when lower(new.email) = 'ludovico.righetto@gmail.com' then true else false end,
    case when lower(new.email) = 'ludovico.righetto@gmail.com' then true else false end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.labels enable row level security;
alter table public.lists enable row level security;
alter table public.tasks enable row level security;
alter table public.task_labels enable row level security;
alter table public.task_assignees enable row level security;
alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.task_attachments enable row level security;
alter table public.roadmap_phases enable row level security;
alter table public.roadmap_goals enable row level security;
alter table public.goal_tasks enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin_user()
  or (public.is_approved_user() and is_approved = true)
);

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "labels_all_for_approved" on public.labels;
create policy "labels_all_for_approved"
on public.labels
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "lists_all_for_approved" on public.lists;
create policy "lists_all_for_approved"
on public.lists
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "tasks_all_for_approved" on public.tasks;
create policy "tasks_all_for_approved"
on public.tasks
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "task_labels_all_for_approved" on public.task_labels;
create policy "task_labels_all_for_approved"
on public.task_labels
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "task_assignees_all_for_approved" on public.task_assignees;
create policy "task_assignees_all_for_approved"
on public.task_assignees
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "checklists_all_for_approved" on public.checklists;
create policy "checklists_all_for_approved"
on public.checklists
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "checklist_items_all_for_approved" on public.checklist_items;
create policy "checklist_items_all_for_approved"
on public.checklist_items
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "task_attachments_all_for_approved" on public.task_attachments;
create policy "task_attachments_all_for_approved"
on public.task_attachments
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "roadmap_phases_all_for_approved" on public.roadmap_phases;
create policy "roadmap_phases_all_for_approved"
on public.roadmap_phases
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "roadmap_goals_all_for_approved" on public.roadmap_goals;
create policy "roadmap_goals_all_for_approved"
on public.roadmap_goals
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

drop policy if exists "goal_tasks_all_for_approved" on public.goal_tasks;
create policy "goal_tasks_all_for_approved"
on public.goal_tasks
for all
to authenticated
using (public.is_approved_user())
with check (public.is_approved_user());

insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', true)
on conflict (id) do nothing;

drop policy if exists "storage_select_attachments" on storage.objects;
create policy "storage_select_attachments"
on storage.objects
for select
to authenticated
using (bucket_id = 'task-attachments' and public.is_approved_user());

drop policy if exists "storage_insert_attachments" on storage.objects;
create policy "storage_insert_attachments"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'task-attachments' and public.is_approved_user());

drop policy if exists "storage_delete_attachments" on storage.objects;
create policy "storage_delete_attachments"
on storage.objects
for delete
to authenticated
using (bucket_id = 'task-attachments' and public.is_approved_user());
