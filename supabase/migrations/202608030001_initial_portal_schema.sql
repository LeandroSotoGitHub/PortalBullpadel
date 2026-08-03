-- Portal Bullpadel — esquema inicial de Supabase
-- Fecha: 2026-08-03
-- Ejecutar completo desde Supabase SQL Editor.

begin;

create type public.app_role as enum ('owner', 'vendedor', 'usuario');
create type public.account_status as enum ('activo', 'inactivo');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  code text unique,
  status public.account_status not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role public.app_role not null default 'usuario',
  status public.account_status not null default 'activo',
  organization_id uuid references public.organizations(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint distributor_requires_organization
    check (role <> 'usuario' or status = 'inactivo' or organization_id is not null)
);

alter table public.organizations
  add column assigned_seller_id uuid references public.profiles(id) on delete set null;

-- El modelo de negocio establece una sola credencial de usuario por mayorista.
create unique index one_distributor_credential_per_organization
  on public.profiles (organization_id)
  where role = 'usuario' and status = 'activo';

create index profiles_organization_id_idx on public.profiles (organization_id);
create index organizations_assigned_seller_id_idx on public.organizations (assigned_seller_id);

create table public.role_permissions (
  role public.app_role not null,
  permission_key text not null,
  allowed boolean not null default false,
  description text not null default '',
  primary key (role, permission_key),
  constraint permission_key_format check (permission_key ~ '^[a-z][a-z0-9_]*$')
);

create table public.training_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_key text not null,
  unit_key text not null,
  completed boolean not null default false,
  checklist jsonb not null default '{}'::jsonb,
  quiz jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module_key, unit_key),
  constraint module_key_not_blank check (char_length(trim(module_key)) > 0),
  constraint unit_key_not_blank check (char_length(trim(unit_key)) > 0),
  constraint checklist_is_object check (jsonb_typeof(checklist) = 'object'),
  constraint quiz_is_object check (jsonb_typeof(quiz) = 'object')
);

create index training_progress_user_id_idx on public.training_progress (user_id);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  onboarding_seen boolean not null default false,
  module_tips jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint module_tips_is_object check (jsonb_typeof(module_tips) = 'object')
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_action_not_blank check (char_length(trim(action)) > 0),
  constraint audit_metadata_is_object check (jsonb_typeof(metadata) = 'object')
);

create index audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger training_progress_set_updated_at
before update on public.training_progress
for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

-- Los metadatos enviados por el navegador nunca deciden el rol.
-- Todo usuario nuevo nace como usuario inactivo y debe ser asignado/activado
-- por una operación administrativa segura.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    'usuario',
    'inactivo'
  );

  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
    and p.status = 'activo'
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select public.current_app_role()) = 'owner', false)
$$;

create or replace function public.is_seller()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select public.current_app_role()) = 'vendedor', false)
$$;

create or replace function public.can_access_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select public.is_owner())
    or exists (
      select 1
      from public.organizations o
      where o.id = target_organization_id
        and o.assigned_seller_id = (select auth.uid())
        and (select public.is_seller())
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.organization_id = target_organization_id
        and p.status = 'activo'
    )
$$;

-- La aplicación puede actualizar solamente el nombre visible propio.
create or replace function public.update_own_display_name(new_display_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if char_length(trim(new_display_name)) < 2 or char_length(trim(new_display_name)) > 120 then
    raise exception 'invalid display name';
  end if;

  update public.profiles
  set display_name = trim(new_display_name)
  where id = auth.uid() and status = 'activo';

  if not found then
    raise exception 'active profile not found';
  end if;
end;
$$;

insert into public.role_permissions (role, permission_key, allowed, description) values
  ('owner', 'view_catalog', true, 'Ver catálogo y fichas'),
  ('owner', 'view_recommender', true, 'Usar recomendador'),
  ('owner', 'view_comparator', true, 'Usar comparador Bullpadel'),
  ('owner', 'view_competition', true, 'Ver mapa competitivo'),
  ('owner', 'view_training', true, 'Ver capacitaciones y guía'),
  ('owner', 'view_media_center', true, 'Ver Media Center'),
  ('owner', 'view_admin', true, 'Ver administración'),
  ('owner', 'manage_all_users', true, 'Administrar todos los usuarios'),
  ('owner', 'manage_assigned_users', true, 'Administrar usuarios asignados'),
  ('owner', 'view_settings', true, 'Ver configuración global'),
  ('owner', 'view_audit', true, 'Ver auditoría'),
  ('vendedor', 'view_catalog', true, 'Ver catálogo y fichas'),
  ('vendedor', 'view_recommender', true, 'Usar recomendador'),
  ('vendedor', 'view_comparator', true, 'Usar comparador Bullpadel'),
  ('vendedor', 'view_competition', true, 'Ver mapa competitivo'),
  ('vendedor', 'view_training', true, 'Ver capacitaciones y guía'),
  ('vendedor', 'view_media_center', true, 'Ver Media Center'),
  ('vendedor', 'view_admin', true, 'Ver administración limitada'),
  ('vendedor', 'manage_all_users', false, 'No administra usuarios globales'),
  ('vendedor', 'manage_assigned_users', true, 'Administra distribuidores asignados'),
  ('vendedor', 'view_settings', false, 'Sin configuración global'),
  ('vendedor', 'view_audit', false, 'Sin auditoría en v1'),
  ('usuario', 'view_catalog', true, 'Ver catálogo y fichas'),
  ('usuario', 'view_recommender', true, 'Usar recomendador'),
  ('usuario', 'view_comparator', true, 'Usar comparador Bullpadel'),
  ('usuario', 'view_competition', false, 'Mapa competitivo restringido'),
  ('usuario', 'view_training', true, 'Ver capacitaciones y guía'),
  ('usuario', 'view_media_center', true, 'Ver Media Center'),
  ('usuario', 'view_admin', false, 'Sin administración'),
  ('usuario', 'manage_all_users', false, 'Sin gestión de usuarios'),
  ('usuario', 'manage_assigned_users', false, 'Sin gestión de usuarios'),
  ('usuario', 'view_settings', false, 'Sin configuración global'),
  ('usuario', 'view_audit', false, 'Sin auditoría');

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.training_progress enable row level security;
alter table public.user_preferences enable row level security;
alter table public.audit_logs enable row level security;

create policy organizations_select_allowed
on public.organizations for select
to authenticated
using ((select public.can_access_organization(id)));

create policy profiles_select_allowed
on public.profiles for select
to authenticated
using (
  id = (select auth.uid())
  or (select public.is_owner())
  or (
    organization_id is not null
    and (select public.is_seller())
    and exists (
      select 1 from public.organizations o
      where o.id = profiles.organization_id
        and o.assigned_seller_id = (select auth.uid())
    )
  )
);

create policy role_permissions_select_authenticated
on public.role_permissions for select
to authenticated
using ((select public.current_app_role()) is not null);

create policy training_progress_select_own
on public.training_progress for select
to authenticated
using (user_id = (select auth.uid()) and (select public.current_app_role()) is not null);

create policy training_progress_insert_own
on public.training_progress for insert
to authenticated
with check (user_id = (select auth.uid()) and (select public.current_app_role()) is not null);

create policy training_progress_update_own
on public.training_progress for update
to authenticated
using (user_id = (select auth.uid()) and (select public.current_app_role()) is not null)
with check (user_id = (select auth.uid()) and (select public.current_app_role()) is not null);

create policy training_progress_delete_own
on public.training_progress for delete
to authenticated
using (user_id = (select auth.uid()) and (select public.current_app_role()) is not null);

create policy user_preferences_select_own
on public.user_preferences for select
to authenticated
using (user_id = (select auth.uid()) and (select public.current_app_role()) is not null);

create policy user_preferences_update_own
on public.user_preferences for update
to authenticated
using (user_id = (select auth.uid()) and (select public.current_app_role()) is not null)
with check (user_id = (select auth.uid()) and (select public.current_app_role()) is not null);

revoke all on public.organizations from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.role_permissions from anon, authenticated;
revoke all on public.training_progress from anon, authenticated;
revoke all on public.user_preferences from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;

grant select on public.organizations to authenticated;
grant select on public.profiles to authenticated;
grant select on public.role_permissions to authenticated;
grant select, insert, update, delete on public.training_progress to authenticated;
grant select, update on public.user_preferences to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_owner() to authenticated;
grant execute on function public.is_seller() to authenticated;
grant execute on function public.can_access_organization(uuid) to authenticated;
grant execute on function public.update_own_display_name(text) to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
revoke execute on function public.current_app_role() from public, anon;
revoke execute on function public.is_owner() from public, anon;
revoke execute on function public.is_seller() from public, anon;
revoke execute on function public.can_access_organization(uuid) from public, anon;
revoke execute on function public.update_own_display_name(text) from public, anon;

commit;
