-- FlowBoard workspace data isolation migration
-- Run this once in Supabase SQL Editor on existing projects.

create extension if not exists pgcrypto;

-- 1) Ensure workspace foundation tables exist
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- 2) Add workspace_id columns (nullable first for safe backfill)
alter table public.labels add column if not exists workspace_id uuid;
alter table public.lists add column if not exists workspace_id uuid;
alter table public.tasks add column if not exists workspace_id uuid;
alter table public.roadmap_phases add column if not exists workspace_id uuid;
alter table public.roadmap_goals add column if not exists workspace_id uuid;

-- 3) Ensure at least one workspace exists (prefer admin owner)
do $$
declare
  default_owner uuid;
  default_workspace uuid;
begin
  if not exists (select 1 from public.workspaces) then
    select id
    into default_owner
    from public.profiles
    where is_admin = true
    order by created_at
    limit 1;

    if default_owner is null then
      select id
      into default_owner
      from public.profiles
      order by created_at
      limit 1;
    end if;

    if default_owner is not null then
      insert into public.workspaces (name, description, created_by)
      values ('Workspace principale', 'Workspace iniziale', default_owner)
      returning id into default_workspace;

      insert into public.workspace_members (workspace_id, user_id)
      values (default_workspace, default_owner)
      on conflict do nothing;
    end if;
  end if;
end $$;

-- 4) Backfill workspace_id from existing relations/default workspace
with default_ws as (
  select id
  from public.workspaces
  order by created_at
  limit 1
)
update public.labels l
set workspace_id = coalesce(
  l.workspace_id,
  (select id from default_ws)
)
where l.workspace_id is null;

with default_ws as (
  select id
  from public.workspaces
  order by created_at
  limit 1
)
update public.lists li
set workspace_id = coalesce(
  li.workspace_id,
  (select id from default_ws)
)
where li.workspace_id is null;

update public.tasks t
set workspace_id = li.workspace_id
from public.lists li
where t.list_id = li.id
  and t.workspace_id is null;

with default_ws as (
  select id
  from public.workspaces
  order by created_at
  limit 1
)
update public.tasks t
set workspace_id = (select id from default_ws)
where t.workspace_id is null;

with default_ws as (
  select id
  from public.workspaces
  order by created_at
  limit 1
)
update public.roadmap_phases rp
set workspace_id = coalesce(
  rp.workspace_id,
  (select id from default_ws)
)
where rp.workspace_id is null;

update public.roadmap_goals rg
set workspace_id = rp.workspace_id
from public.roadmap_phases rp
where rg.phase_id = rp.id
  and rg.workspace_id is null;

with default_ws as (
  select id
  from public.workspaces
  order by created_at
  limit 1
)
update public.roadmap_goals rg
set workspace_id = (select id from default_ws)
where rg.workspace_id is null;

-- 5) Add FK + NOT NULL once data is backfilled
alter table public.labels
  alter column workspace_id set not null;
alter table public.lists
  alter column workspace_id set not null;
alter table public.tasks
  alter column workspace_id set not null;
alter table public.roadmap_phases
  alter column workspace_id set not null;
alter table public.roadmap_goals
  alter column workspace_id set not null;

alter table public.labels
  drop constraint if exists labels_workspace_id_fkey,
  add constraint labels_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete cascade;

alter table public.lists
  drop constraint if exists lists_workspace_id_fkey,
  add constraint lists_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete cascade;

alter table public.tasks
  drop constraint if exists tasks_workspace_id_fkey,
  add constraint tasks_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete cascade;

alter table public.roadmap_phases
  drop constraint if exists roadmap_phases_workspace_id_fkey,
  add constraint roadmap_phases_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete cascade;

alter table public.roadmap_goals
  drop constraint if exists roadmap_goals_workspace_id_fkey,
  add constraint roadmap_goals_workspace_id_fkey
    foreign key (workspace_id) references public.workspaces(id) on delete cascade;

-- 6) Helpful indexes
create index if not exists idx_labels_workspace_id on public.labels(workspace_id);
create index if not exists idx_lists_workspace_id on public.lists(workspace_id);
create index if not exists idx_tasks_workspace_id on public.tasks(workspace_id);
create index if not exists idx_roadmap_phases_workspace_id on public.roadmap_phases(workspace_id);
create index if not exists idx_roadmap_goals_workspace_id on public.roadmap_goals(workspace_id);
create index if not exists idx_workspace_members_workspace_id on public.workspace_members(workspace_id);
create index if not exists idx_workspace_members_user_id on public.workspace_members(user_id);

create or replace function public.can_access_workspace(workspace uuid)
returns boolean
language sql
stable
as $$
  select public.is_admin_user()
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspace
        and wm.user_id = auth.uid()
    );
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

drop policy if exists "workspaces_select" on public.workspaces;
create policy "workspaces_select"
on public.workspaces
for select
to authenticated
using (
  public.is_admin_user()
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "workspaces_insert_for_approved" on public.workspaces;
create policy "workspaces_insert_for_approved"
on public.workspaces
for insert
to authenticated
with check (
  public.is_approved_user()
  and created_by = auth.uid()
);

drop policy if exists "workspaces_update_admin_or_creator" on public.workspaces;
create policy "workspaces_update_admin_or_creator"
on public.workspaces
for update
to authenticated
using (public.is_admin_user() or created_by = auth.uid())
with check (public.is_admin_user() or created_by = auth.uid());

drop policy if exists "workspaces_delete_admin_or_creator" on public.workspaces;
create policy "workspaces_delete_admin_or_creator"
on public.workspaces
for delete
to authenticated
using (public.is_admin_user() or created_by = auth.uid());

drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select"
on public.workspace_members
for select
to authenticated
using (public.is_admin_user() or user_id = auth.uid());

drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
create policy "workspace_members_insert_admin"
on public.workspace_members
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "workspace_members_delete_admin" on public.workspace_members;
create policy "workspace_members_delete_admin"
on public.workspace_members
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "labels_all_for_approved" on public.labels;
create policy "labels_all_for_approved"
on public.labels
for all
to authenticated
using (public.is_approved_user() and public.can_access_workspace(workspace_id))
with check (public.is_approved_user() and public.can_access_workspace(workspace_id));

drop policy if exists "lists_all_for_approved" on public.lists;
create policy "lists_all_for_approved"
on public.lists
for all
to authenticated
using (public.is_approved_user() and public.can_access_workspace(workspace_id))
with check (public.is_approved_user() and public.can_access_workspace(workspace_id));

drop policy if exists "tasks_all_for_approved" on public.tasks;
create policy "tasks_all_for_approved"
on public.tasks
for all
to authenticated
using (public.is_approved_user() and public.can_access_workspace(workspace_id))
with check (public.is_approved_user() and public.can_access_workspace(workspace_id));

drop policy if exists "roadmap_phases_all_for_approved" on public.roadmap_phases;
create policy "roadmap_phases_all_for_approved"
on public.roadmap_phases
for all
to authenticated
using (public.is_approved_user() and public.can_access_workspace(workspace_id))
with check (public.is_approved_user() and public.can_access_workspace(workspace_id));

drop policy if exists "roadmap_goals_all_for_approved" on public.roadmap_goals;
create policy "roadmap_goals_all_for_approved"
on public.roadmap_goals
for all
to authenticated
using (public.is_approved_user() and public.can_access_workspace(workspace_id))
with check (public.is_approved_user() and public.can_access_workspace(workspace_id));
