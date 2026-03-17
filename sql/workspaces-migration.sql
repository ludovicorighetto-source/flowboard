-- FlowBoard workspace foundation migration
-- Safe to run multiple times (idempotent)

create extension if not exists pgcrypto;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_approved = true
      and (
        is_admin = true
        or lower(email) = 'ludovico.righetto@gmail.com'
      )
  );
$$;

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

create index if not exists idx_workspaces_created_by on public.workspaces(created_by);
create index if not exists idx_workspace_members_user_id on public.workspace_members(user_id);
create index if not exists idx_workspace_members_workspace_id on public.workspace_members(workspace_id);

create or replace function public.set_workspace_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workspace_updated_at on public.workspaces;
create trigger set_workspace_updated_at
before update on public.workspaces
for each row
execute procedure public.set_workspace_updated_at();

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
using (
  public.is_admin_user()
  or user_id = auth.uid()
);

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
