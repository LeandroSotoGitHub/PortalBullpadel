-- Portal Bullpadel — Permisos SQL mínimos para service_role (Fase 2, fix)
-- Fecha: 2026-08-04
-- No modifica 202608030001 ni 202608030002 — ambas ya están aplicadas.
--
-- Causa del error real encontrado en la primera prueba funcional del panel
-- de Administración ("permission denied for table organizations"): el
-- cliente de servicio de la Edge Function (ctx.supabaseAdmin, usa la
-- service_role key) bypassa RLS, pero bypassar RLS NO bypassa los
-- privilegios SQL estándar de Postgres — service_role sigue necesitando
-- GRANT explícito sobre cada tabla/verbo que use, igual que cualquier otro
-- rol. Las migraciones 001 y 002 solo otorgaron privilegios a
-- `authenticated` (para las lecturas RLS-scoped del frontend); nunca se le
-- otorgó nada a `service_role`.
--
-- Este archivo concede exclusivamente los privilegios mínimos que
-- supabase/functions/admin-portal/index.ts efectivamente usa contra cada
-- tabla (verificado línea por línea contra el código antes de escribir
-- esto):
--   - organizations: SELECT, INSERT, UPDATE (nunca DELETE — no hay borrado
--     físico de organizaciones en el código).
--   - profiles: SELECT, UPDATE (nunca INSERT — el alta inicial la hace el
--     trigger handle_new_auth_user, SECURITY DEFINER, no la Edge Function;
--     nunca DELETE — las bajas son lógicas vía status).
--   - audit_logs: INSERT únicamente (nunca SELECT/UPDATE/DELETE desde
--     service_role — la única lectura de auditoría es para `owner` vía RLS
--     con el rol `authenticated`, ya cubierta por la policy de 002).
--
-- No se otorga ALL PRIVILEGES, nada a `anon`, ninguna escritura adicional a
-- `authenticated` más allá de lo que ya tenía, ni DELETE sobre ninguna
-- tabla.

begin;

grant usage on schema public to service_role;

grant select, insert, update
on table public.organizations
to service_role;

grant select, update
on table public.profiles
to service_role;

grant insert
on table public.audit_logs
to service_role;

commit;
