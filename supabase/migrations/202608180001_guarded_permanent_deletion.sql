-- Portal Bullpadel — Eliminación permanente protegida (solo owner)
-- Fecha: 2026-08-18
--
-- Agrega defensa en profundidad para las dos bajas físicas expuestas por
-- admin-portal:
--   1. cuentas: Auth Admin borra auth.users y el FK ON DELETE CASCADE borra
--      public.profiles; este trigger impide borrar owners, cuentas activas o
--      vendedores que todavía tengan organizaciones asignadas;
--   2. organizaciones: una RPC privada SECURITY DEFINER permite borrar solo
--      organizaciones inactivas, sin vendedor y sin cuentas vinculadas.
--
-- No se concede DELETE sobre ninguna tabla a anon/authenticated/service_role.
-- El navegador nunca puede invocar estas operaciones en forma directa.

begin;

-- ── 1. Cuentas: defensa ante borrado físico inseguro ─────────────────────

create or replace function public.prevent_unsafe_profile_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_count integer;
begin
  -- Los owners no se eliminan físicamente desde Administración. Esto evita
  -- tanto la autoeliminación como perder historial/autoridad por error.
  if old.role = 'owner' then
    raise exception '[owner_deletion_forbidden] Las cuentas owner no se pueden eliminar desde el portal.'
      using errcode = '23514';
  end if;

  -- La baja permanente siempre exige una desactivación explícita previa.
  if old.status is distinct from 'inactivo' then
    raise exception '[account_must_be_inactive] La cuenta debe estar inactiva antes de eliminarse.'
      using errcode = '23514';
  end if;

  -- Usa el mismo lock que las asignaciones/desactivaciones de la migración
  -- 002. Así una asignación concurrente no puede colarse entre el chequeo y
  -- el borrado del vendedor.
  if old.role = 'vendedor' then
    perform public.lock_seller_guard(old.id);

    select count(*) into assigned_count
    from public.organizations
    where assigned_seller_id = old.id;

    if assigned_count > 0 then
      raise exception '[seller_still_assigned] No se puede eliminar un vendedor con organizaciones asignadas.'
        using errcode = '23514';
    end if;
  end if;

  return old;
end;
$$;

create trigger profiles_prevent_unsafe_deletion
before delete on public.profiles
for each row execute function public.prevent_unsafe_profile_deletion();

revoke execute on function public.prevent_unsafe_profile_deletion()
from public, anon, authenticated;

-- ── 2. Organizaciones: única vía SQL autorizada de borrado ───────────────

create or replace function public.admin_delete_empty_organization(
  p_organization_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.organizations%rowtype;
  deleted_id uuid;
  org_guard_namespace constant int := 720261;
begin
  -- Serializa intentos concurrentes sobre esta organización sin bloquear
  -- eliminaciones independientes de otras organizaciones.
  perform pg_catalog.pg_advisory_xact_lock(
    org_guard_namespace,
    pg_catalog.hashtext(p_organization_id::text)
  );

  select o.* into target
  from public.organizations o
  where o.id = p_organization_id
  for update;

  if not found then
    raise exception '[organization_not_found] Organización no encontrada.'
      using errcode = '23514';
  end if;

  if target.status is distinct from 'inactivo' then
    raise exception '[organization_must_be_inactive] La organización debe estar inactiva antes de eliminarse.'
      using errcode = '23514';
  end if;

  if target.assigned_seller_id is not null then
    raise exception '[organization_seller_assigned] La organización todavía tiene un vendedor asignado.'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.organization_id = target.id
  ) then
    raise exception '[organization_has_accounts] La organización todavía tiene cuentas vinculadas.'
      using errcode = '23514';
  end if;

  delete from public.organizations
  where id = target.id
  returning id into deleted_id;

  return deleted_id;
end;
$$;

revoke execute on function public.admin_delete_empty_organization(uuid)
from public, anon, authenticated;
grant execute on function public.admin_delete_empty_organization(uuid)
to service_role;

commit;
