-- Portal Bullpadel — seguimiento automático de altas y accesos
-- Fecha: 2026-08-28
--
-- Fuente de verdad para sincronizar el estado de cada cuenta con la hoja de
-- altas. El navegador no puede leer ni escribir estas tablas: las
-- invitaciones se registran desde admin-portal, los eventos de correo desde
-- brevo-webhook y el login propio mediante una RPC de alcance estricto.

begin;

create table public.portal_access_status (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email text not null,
  organization_id uuid references public.organizations(id) on delete set null,
  invitation_sent_at timestamptz,
  email_stage text not null default 'invitation_sent',
  email_stage_at timestamptz,
  email_error_code text,
  email_error_at timestamptz,
  first_portal_login_at timestamptz,
  last_portal_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portal_access_status_email_normalized
    check (email = lower(trim(email)) and char_length(email) between 3 and 320),
  constraint portal_access_status_email_stage
    check (email_stage in ('invitation_sent', 'delivered', 'opened'))
);

create unique index portal_access_status_email_unique
  on public.portal_access_status (email);
create index portal_access_status_organization_idx
  on public.portal_access_status (organization_id);
create index portal_access_status_updated_at_idx
  on public.portal_access_status (updated_at desc);

create trigger portal_access_status_set_updated_at
before update on public.portal_access_status
for each row execute function public.set_updated_at();

-- Bitácora técnica acotada para deduplicar y diagnosticar webhooks. No se
-- guarda el payload crudo de Brevo, tokens, cabeceras ni contenido del mail.
create table public.portal_email_events (
  id bigint generated always as identity primary key,
  event_key text not null unique,
  email text not null,
  event_type text not null,
  message_id text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint portal_email_events_key_not_blank
    check (char_length(trim(event_key)) between 16 and 160),
  constraint portal_email_events_email_normalized
    check (email = lower(trim(email)) and char_length(email) between 3 and 320),
  constraint portal_email_events_type_not_blank
    check (char_length(trim(event_type)) between 2 and 64)
);

create index portal_email_events_email_occurred_idx
  on public.portal_email_events (email, occurred_at desc);

-- Registra exclusivamente el acceso del usuario autenticado. La función
-- ignora cualquier email/id enviado por el navegador y deriva todo de
-- auth.uid() + public.profiles. Un fallo en esta RPC se trata como best-effort
-- desde el frontend y nunca impide el login.
create or replace function public.record_own_portal_login()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor public.profiles%rowtype;
  occurred_at timestamptz := now();
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  select p.*
  into actor
  from public.profiles p
  where p.id = (select auth.uid())
    and p.status = 'activo';

  if not found then
    raise exception 'active profile not found';
  end if;

  insert into public.portal_access_status (
    profile_id,
    email,
    organization_id,
    invitation_sent_at,
    email_stage,
    email_stage_at,
    first_portal_login_at,
    last_portal_login_at
  ) values (
    actor.id,
    lower(trim(actor.email)),
    actor.organization_id,
    actor.created_at,
    'invitation_sent',
    actor.created_at,
    occurred_at,
    occurred_at
  )
  on conflict (profile_id) do update
  set
    email = excluded.email,
    organization_id = excluded.organization_id,
    first_portal_login_at = coalesce(
      public.portal_access_status.first_portal_login_at,
      excluded.first_portal_login_at
    ),
    last_portal_login_at = excluded.last_portal_login_at;
end;
$$;

-- Estado inicial para las cuentas ya existentes. Para los accesos históricos
-- solo conocemos last_sign_in_at de Auth; desde esta migración en adelante la
-- RPC anterior registra el ingreso real al portal de forma explícita.
insert into public.portal_access_status (
  profile_id,
  email,
  organization_id,
  invitation_sent_at,
  email_stage,
  email_stage_at,
  first_portal_login_at,
  last_portal_login_at
)
select
  p.id,
  lower(trim(p.email)),
  p.organization_id,
  p.created_at,
  'invitation_sent',
  p.created_at,
  u.last_sign_in_at,
  u.last_sign_in_at
from public.profiles p
left join auth.users u on u.id = p.id
where char_length(trim(p.email)) between 3 and 320
on conflict (profile_id) do nothing;

alter table public.portal_access_status enable row level security;
alter table public.portal_email_events enable row level security;

revoke all on public.portal_access_status from public, anon, authenticated;
revoke all on public.portal_email_events from public, anon, authenticated;

-- Las Edge Functions usan service_role. No se abre acceso directo al browser.
grant select, insert, update on public.portal_access_status to service_role;
grant select, insert on public.portal_email_events to service_role;
grant usage, select on sequence public.portal_email_events_id_seq to service_role;

revoke execute on function public.record_own_portal_login() from public, anon;
grant execute on function public.record_own_portal_login() to authenticated;

commit;
