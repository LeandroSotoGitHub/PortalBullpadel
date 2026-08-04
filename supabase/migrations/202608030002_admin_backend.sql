-- Portal Bullpadel — Administración segura (Fase 2)
-- Fecha: 2026-08-03
-- No modifica la migración inicial (202608030001_initial_portal_schema.sql).
-- Agrega solamente lo necesario para que supabase/functions/admin-portal
-- pueda operar con autoridad real y para que el frontend pueda listar bajo
-- RLS lo que ya le corresponde ver por rol.
--
-- Las escrituras privilegiadas (crear/editar organización, asignar vendedor,
-- invitar, activar/desactivar, recuperación de contraseña) NO pasan por
-- policies de escritura para anon/authenticated: pasan exclusivamente por la
-- Edge Function admin-portal, que usa el cliente de servicio (bypassa RLS)
-- después de validar rol/estado/alcance del actor en cada llamada. Esta
-- migración no crea ningún insert/update/delete policy sobre
-- organizations/profiles/audit_logs para el navegador.

begin;

-- ── 1. Constraint: solo `usuario` puede pertenecer a una organización ─────
-- owner y vendedor nunca tienen profiles.organization_id — la asignación de
-- un vendedor a una organización vive en organizations.assigned_seller_id,
-- no acá. Esto ya era el diseño implícito de Fase 1; se refuerza a nivel de
-- base para que ningún camino (ni siquiera el cliente de servicio con un
-- bug) pueda dejar un owner/vendedor con organization_id seteado.
alter table public.profiles
  add constraint non_usuario_no_organization
  check (role = 'usuario' or organization_id is null);

-- ── 2. Índices para los listados de Administración ─────────────────────────
create index if not exists profiles_role_status_idx
  on public.profiles (role, status);

create index if not exists organizations_status_idx
  on public.organizations (status);

-- ── 3. Lectura de auditoría — solo owner, vía RLS directa ──────────────────
-- Las inserciones a audit_logs siguen pasando exclusivamente por la Edge
-- Function (cliente de servicio, ver admin-portal/index.ts). Acá solo se
-- habilita la LECTURA para el owner, consistente con la matriz de accesos
-- (briefs-reportes/MATRIZ_ACCESOS_SUPABASE.md: "Consultar auditoría: Owner
-- Sí, Vendedor No, Usuario No").
create policy audit_logs_select_owner
on public.audit_logs for select
to authenticated
using ((select public.is_owner()));

grant select on public.audit_logs to authenticated;

-- ── 4. Protección del último owner activo (defensa en profundidad) ────────
-- La Edge Function ya valida esto antes de escribir (ver
-- assertNotLastActiveOwner en admin-portal/index.ts), pero este trigger
-- corre para CUALQUIER actualización de profiles, incluida la del cliente
-- de servicio — actúa como red de seguridad adicional ante un eventual bug
-- en la función: nunca permite que el portal quede con 0 owners activos.
--
-- Corrección de concurrencia: sin un lock, dos transacciones que degradan/
-- desactivan en simultáneo a dos owners activos distintos (de un total de
-- 2) pueden cada una contar "1 owner restante" ANTES de que la otra haga
-- commit, y ambas pasarían la validación — el portal terminaría con 0
-- owners activos. `pg_advisory_xact_lock` serializa la sección crítica:
-- la segunda transacción espera a que la primera haga commit/rollback antes
-- de poder contar, así que ve el estado ya actualizado.
--
-- Convención de mensajes: todas las excepciones de negocio de esta
-- migración (todas con errcode 23514) arrancan con un tag `[codigo_estable]`
-- que la Edge Function usa para mapear a un código/mensaje HTTP concreto sin
-- depender de parsear la prosa en español (ver extractPgTag en
-- admin-portal/index.ts). El texto después del tag es humano, para logs/
-- SQL Editor.
create or replace function public.prevent_last_owner_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  remaining_owners integer;
  -- Clave arbitraria pero fija para este guard puntual — no coincide con
  -- ningún otro pg_advisory_lock usado en el portal. Cualquier transacción
  -- que intente degradar/desactivar un owner activo debe adquirirla antes
  -- de contar, así que las concurrentes se serializan entre sí.
  last_owner_guard_key constant bigint := 72026003;
begin
  if old.role = 'owner' and old.status = 'activo'
     and (new.role is distinct from 'owner' or new.status is distinct from 'activo') then
    perform pg_catalog.pg_advisory_xact_lock(last_owner_guard_key);

    select count(*) into remaining_owners
    from public.profiles
    where role = 'owner' and status = 'activo' and id <> old.id;

    if remaining_owners = 0 then
      raise exception '[last_owner_protected] No se puede desactivar ni degradar al último owner activo del portal.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_last_owner_removal
before update on public.profiles
for each row execute function public.prevent_last_owner_removal();

revoke execute on function public.prevent_last_owner_removal() from public, anon, authenticated;

-- ── 5. Lock compartido de "vendedor asignado" + vendedor siempre activo ───
-- Carrera que esto cierra: (a) asignar una organización a un vendedor V y
-- (b) desactivar a V son transacciones separadas que, sin coordinación,
-- pueden cada una leer el estado "de antes" de la otra y las dos pasar su
-- propia validación — (a) ve a V todavía activo y lo asigna, (b) ve 0
-- organizaciones asignadas a V (todavía) y lo desactiva; ambas hacen commit
-- y el resultado es una organización asignada a un vendedor inactivo.
--
-- `lock_seller_guard(seller_id)` es la sección crítica compartida: TANTO
-- prevent_invalid_seller_assignment() (con NEW.assigned_seller_id, al
-- asignar) COMO prevent_deactivating_assigned_seller() (con OLD.id, al
-- desactivar) deben tomar el MISMO lock para el MISMO vendedor antes de
-- validar — así se serializan entre sí: la segunda transacción en llegar
-- espera a que la primera haga commit/rollback, y su lectura posterior
-- (select) ya ve el estado final y correcto de la primera (READ COMMITTED
-- estándar de Postgres). Si cada trigger usara su propia clave no
-- relacionada, no se bloquearían entre sí y la carrera seguiría abierta.
--
-- Namespace propio (720260, forma de dos claves int32) para no colisionar
-- con pg_advisory_xact_lock(72026003) (guard de último owner, forma de un
-- solo bigint) — con la forma de dos claves, Postgres arma internamente
-- (namespace::bigint << 32) | key; con namespace = 720260 (≠ 0) el rango
-- resultante nunca puede coincidir con el valor fijo 72026003 usado por el
-- guard de último owner, sin importar el hash de la segunda clave.
--
-- Función auxiliar privada: SECURITY DEFINER, search_path fijo, referencias
-- calificadas, sin EXECUTE para public/anon/authenticated — no es invocable
-- directamente desde el cliente, solo la usan los triggers de esta sección.
create or replace function public.lock_seller_guard(seller_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  seller_guard_namespace constant int := 720260;
begin
  perform pg_catalog.pg_advisory_xact_lock(seller_guard_namespace, hashtext(seller_id::text));
end;
$$;

revoke execute on function public.lock_seller_guard(uuid) from public, anon, authenticated;

-- Defensa en profundidad para assign_seller: ni siquiera un bug en la Edge
-- Function puede dejar una organización con assigned_seller_id apuntando a
-- un perfil que no sea vendedor/activo.
create or replace function public.prevent_invalid_seller_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assigned_seller_id is not null then
    perform public.lock_seller_guard(new.assigned_seller_id);

    if not exists (
      select 1 from public.profiles
      where id = new.assigned_seller_id
        and role = 'vendedor'
        and status = 'activo'
    ) then
      raise exception '[invalid_seller] El vendedor asignado debe existir, tener rol vendedor y estar activo.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger organizations_prevent_invalid_seller_assignment
before insert or update on public.organizations
for each row execute function public.prevent_invalid_seller_assignment();

revoke execute on function public.prevent_invalid_seller_assignment() from public, anon, authenticated;

-- ── 6. Desactivar una organización desactiva a su credencial `usuario` ────
-- Una organización inactiva no debe seguir teniendo una credencial que
-- puede iniciar sesión — si no, "desactivar distribuidor" no revoca acceso
-- real. Esto corre en la MISMA transacción que el UPDATE de organizations
-- que dispara el trigger (garantía estándar de Postgres: un trigger AFTER
-- forma parte de la transacción del statement que lo disparó; si algo falla
-- después, todo se revierte junto).
--
-- Deliberadamente asimétrico: reactivar la organización NO reactiva a sus
-- usuarios — la reactivación de una cuenta es una decisión explícita del
-- owner/vendedor vía la acción set_account_status (Edge Function), nunca un
-- efecto secundario automático. Documentado también en supabase/SETUP.md.
create or replace function public.cascade_deactivate_org_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'inactivo' and old.status is distinct from 'inactivo' then
    update public.profiles
    set status = 'inactivo'
    where organization_id = new.id
      and role = 'usuario'
      and status = 'activo';
  end if;

  return new;
end;
$$;

create trigger organizations_cascade_deactivate_users
after update on public.organizations
for each row execute function public.cascade_deactivate_org_users();

revoke execute on function public.cascade_deactivate_org_users() from public, anon, authenticated;

-- ── 7. Un vendedor con organizaciones asignadas no puede desactivarse ni
--       perder el rol vendedor (defensa en profundidad) ───────────────────
-- La Edge Function ya rechaza esto con 409 (seller_still_assigned) antes de
-- escribir (ver handleSetAccountStatus en admin-portal/index.ts). Este
-- trigger es la red de seguridad a nivel de base — corre para cualquier
-- actualización de profiles, incluida la del cliente de servicio, para que
-- un bug en la función nunca deje una organización con un vendedor asignado
-- que ya no está activo ni tiene rol vendedor.
--
-- Toma el MISMO lock que prevent_invalid_seller_assignment() (sección 5),
-- con OLD.id — es la otra mitad de la serialización contra la carrera
-- "asignar organización a V" vs "desactivar V". Ver el comentario largo en
-- la sección 5 para el porqué completo.
create or replace function public.prevent_deactivating_assigned_seller()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_count integer;
begin
  if old.role = 'vendedor' and old.status = 'activo'
     and (new.status is distinct from 'activo' or new.role is distinct from 'vendedor') then
    perform public.lock_seller_guard(old.id);

    select count(*) into assigned_count
    from public.organizations
    where assigned_seller_id = old.id;

    if assigned_count > 0 then
      raise exception '[seller_still_assigned] No se puede desactivar ni cambiar el rol de un vendedor con organizaciones asignadas.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_deactivating_assigned_seller
before update on public.profiles
for each row execute function public.prevent_deactivating_assigned_seller();

revoke execute on function public.prevent_deactivating_assigned_seller() from public, anon, authenticated;

-- ── 8. Una credencial `usuario` no puede quedar activa con una
--       organización inexistente o inactiva ─────────────────────────────
-- Cierra el hueco que dejaba la cascada de la sección 6: esa cascada corre
-- SOLO cuando una organización pasa a inactivo, pero después nada impedía
-- que set_account_status reactivara a mano ese mismo usuario mientras su
-- organización seguía inactiva. La Edge Function ya lo valida antes de
-- escribir (ver handleSetAccountStatus), este trigger es la red de base:
-- corre en INSERT y en UPDATE, para cualquier camino que intente dejar un
-- `usuario` en status='activo'.
--
-- No interfiere con la cascada de desactivación: acá solo se valida cuando
-- NEW.status = 'activo' — un perfil que PASA a inactivo (como hace la
-- cascada de la sección 6) nunca entra a este bloque, sin importar el
-- estado de su organización.
create or replace function public.prevent_usuario_active_without_active_org()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  org_status public.account_status;
begin
  if new.role = 'usuario' and new.status = 'activo' then
    if new.organization_id is null then
      raise exception '[organization_inactive] Una credencial de usuario activa debe pertenecer a una organización activa.'
        using errcode = '23514';
    end if;

    select o.status into org_status
    from public.organizations o
    where o.id = new.organization_id;

    if org_status is null or org_status <> 'activo' then
      raise exception '[organization_inactive] No se puede activar esta cuenta porque su organización está inactiva.'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_usuario_active_without_active_org
before insert or update on public.profiles
for each row execute function public.prevent_usuario_active_without_active_org();

revoke execute on function public.prevent_usuario_active_without_active_org() from public, anon, authenticated;

commit;
