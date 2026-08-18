-- Portal Bullpadel — Códigos automáticos de organización
-- Fecha: 2026-08-18
--
-- Los códigos dejan de ser un dato ingresado por el owner. PostgreSQL los
-- genera en forma correlativa y segura ante altas concurrentes: 001, 002,
-- 003... A partir de 1000 continúa como 1000, 1001, etc., sin truncar.

begin;

create sequence if not exists public.organization_code_seq
  as bigint
  minvalue 1
  start with 1
  increment by 1;

-- Inicializar la secuencia desde el mayor código numérico que ya exista.
-- Los códigos históricos no numéricos se conservan, pero no intervienen en
-- la numeración automática.
do $$
declare
  current_max bigint;
begin
  select coalesce(max(code::bigint), 0)
  into current_max
  from public.organizations
  where code ~ '^[0-9]+$';

  if current_max > 0 then
    perform pg_catalog.setval('public.organization_code_seq'::regclass, current_max, true);
  else
    perform pg_catalog.setval('public.organization_code_seq'::regclass, 1, false);
  end if;
end;
$$;

create or replace function public.next_organization_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  next_number bigint;
begin
  next_number := pg_catalog.nextval('public.organization_code_seq'::regclass);

  if next_number < 1000 then
    return pg_catalog.lpad(next_number::text, 3, '0');
  end if;

  return next_number::text;
end;
$$;

revoke execute on function public.next_organization_code()
from public, anon, authenticated;
grant execute on function public.next_organization_code()
to service_role;

alter table public.organizations
  alter column code set default public.next_organization_code();

commit;
