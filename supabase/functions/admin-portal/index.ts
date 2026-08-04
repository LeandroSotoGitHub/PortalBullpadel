// Portal Bullpadel — Administración segura (Fase 2)
//
// Única puerta de entrada para toda operación privilegiada de
// organizaciones/cuentas. El frontend (js/admin.js) llama esta función vía
// `supabaseClient.functions.invoke('admin-portal', { body: { action, payload } })`.
//
// Usa el wrapper oficial `@supabase/server` (withSupabase) fijado en la
// versión 1.4.1 — ver https://github.com/supabase/server. `auth: 'user'`
// obliga JWT válido (401 automático si falta/es inválido) y crea dos
// clientes:
//   - ctx.supabase       → RLS-scoped con el JWT del que llama.
//   - ctx.supabaseAdmin  → cliente de servicio (bypassa RLS). Solo se usa
//     DENTRO de esta función, nunca se expone al navegador.
// Las claves (SUPABASE_URL, *_PUBLISHABLE_KEYS, *_SECRET_KEYS, *_JWKS) las
// inyecta automáticamente el runtime de Edge Functions — no requieren
// `supabase secrets set`. La única variable de entorno propia de esta
// función es PORTAL_BASE_URL (ver supabase/SETUP.md).
//
// No confía en nada que envíe el cliente salvo el JWT: el rol/estado/
// alcance del actor se recalculan en cada llamada contra public.profiles.
import { withSupabase } from 'npm:@supabase/server@1.4.1'

// ─────────────────────────────────────────────────────────────────────────
// Contrato: { action: string, payload: object }
// ─────────────────────────────────────────────────────────────────────────

type Payload = Record<string, unknown>

interface AdminRequestBody {
  action?: unknown
  payload?: unknown
}

interface ActorProfile {
  id: string
  role: 'owner' | 'vendedor' | 'usuario'
  status: 'activo' | 'inactivo'
  organization_id: string | null
}

interface TargetProfile {
  id: string
  email: string
  display_name: string
  role: 'owner' | 'vendedor' | 'usuario'
  status: 'activo' | 'inactivo'
  organization_id: string | null
}

interface Organization {
  id: string
  name: string
  code: string | null
  status: 'activo' | 'inactivo'
  assigned_seller_id: string | null
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers de respuesta
// ─────────────────────────────────────────────────────────────────────────

function ok(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

function fail(status: number, message: string, code: string): Response {
  return Response.json({ error: { message, code } }, { status })
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers de validación (whitelist explícita — nunca confiar en el shape)
// ─────────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Nota de diseño: `payload` es Record<string, unknown> (nunca se confía en
// su shape). En vez de "isX(payload.campo)" + reutilizar payload.campo más
// abajo (que depende de que TS angoste un acceso indexado — no siempre
// confiable), estos helpers devuelven el valor ya validado y tipado, o
// null. Cada acción asigna ese resultado a una constante y sigue esa
// constante, nunca vuelve a leer el payload crudo.

function readUuid(payload: Payload, key: string): string | null {
  const v = payload[key]
  return typeof v === 'string' && UUID_RE.test(v) ? v : null
}

function readEmail(payload: Payload, key: string): string | null {
  const v = payload[key]
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length > 0 && t.length <= 254 && EMAIL_RE.test(t) ? t : null
}

function readTrimmedString(payload: Payload, key: string, min: number, max: number): string | null {
  const v = payload[key]
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length >= min && t.length <= max ? t : null
}

function readAccountStatus(payload: Payload, key: string): 'activo' | 'inactivo' | null {
  const v = payload[key]
  return v === 'activo' || v === 'inactivo' ? v : null
}

function readPortalRole(payload: Payload, key: string): 'vendedor' | 'usuario' | null {
  const v = payload[key]
  return v === 'vendedor' || v === 'usuario' ? v : null
}

function pgErrorCode(error: unknown): string | undefined {
  return (error as { code?: string } | null)?.code
}

// Los triggers de negocio de supabase/migrations/202608030002_admin_backend.sql
// siempre usan errcode 23514 (check_violation) y arrancan su mensaje con un
// tag `[codigo_estable]` — esto lee ese tag para mapear a un código/mensaje
// HTTP concreto sin depender de parsear la prosa en español (frágil ante
// cualquier retoque de wording). Ver la convención documentada en la
// migración, sección 4.
function extractPgTag(error: unknown): string | null {
  const message = (error as { message?: string } | null)?.message
  if (typeof message !== 'string') return null
  const match = message.match(/^\[([a-z_]+)\]/)
  return match ? match[1] : null
}

// ─────────────────────────────────────────────────────────────────────────
// PORTAL_BASE_URL — para redirectTo. NUNCA se acepta una URL enviada por el
// cliente: siempre sale de la variable de entorno del lado servidor.
// ─────────────────────────────────────────────────────────────────────────

function getPortalBaseUrl(): string | null {
  const raw = Deno.env.get('PORTAL_BASE_URL') ?? ''
  try {
    const u = new URL(raw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return raw
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Auditoría — BEST-EFFORT, no transaccional con la mutación
// ─────────────────────────────────────────────────────────────────────────
// IMPORTANTE (documentado explícitamente, no dar por sentado lo contrario):
// el insert de auditoría es una llamada separada, DESPUÉS de que la
// mutación (organizations/profiles) ya hizo commit. Si esta insert falla,
// la mutación NO se revierte — la operación de negocio ya quedó aplicada
// sin su registro de auditoría. Nunca se bloquea ni se revierte la
// respuesta principal por esto; el fallo se registra en logs del servidor,
// de forma estructurada y sin datos sensibles (nunca tokens, contraseñas,
// ni el contenido de `metadata`, que puede incluir email/nombre — no son
// secretos, pero no hacen falta para diagnosticar un fallo de insert).
//
// Deuda técnica conocida: para que mutación + auditoría sean atómicas,
// estas acciones deberían reescribirse como funciones RPC de Postgres
// (SECURITY DEFINER) que hagan el UPDATE/INSERT de negocio y el INSERT en
// audit_logs dentro de la misma transacción SQL, invocadas por la Edge
// Function vía `admin.rpc(...)` en vez de `.from(...).update(...)` +
// `logAudit()` como pasos separados. No se implementa en esta run.
//
// Excepción explícita: el flujo de invite_user combina Supabase Auth Admin
// (inviteUserByEmail/deleteUser, que vive en un sistema aparte del
// Postgres del proyecto) con un UPDATE de profiles — ese flujo NO puede
// ser transaccional con SQL nunca, ni con la migración a RPC de arriba.
// Su compensación (deleteUser si el UPDATE post-invite falla) ya está
// implementada en handleInviteUser y es lo máximo razonable sin un
// mecanismo de sagas/outbox, que está fuera de alcance de esta run.
async function logAudit(
  admin: any,
  entry: {
    actorUserId: string | null
    action: string
    targetType?: string | null
    targetId?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  const { error } = await admin.from('audit_logs').insert({
    actor_user_id: entry.actorUserId,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: entry.metadata ?? {},
  })
  if (error) {
    // Log estructurado, sin exponer esto al cliente (la operación principal
    // ya se resolvió) y sin volcar `metadata` cruda ni el error completo de
    // Postgres — solo lo necesario para diagnosticar cuál auditoría faltó.
    console.error(
      JSON.stringify({
        event: 'admin_portal_audit_insert_failed',
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        actorUserId: entry.actorUserId,
        errorMessage: error.message,
      }),
    )
  }
}

async function rejected(
  admin: any,
  actorId: string | null,
  reason: string,
  extra?: Record<string, unknown>,
): Promise<void> {
  await logAudit(admin, {
    actorUserId: actorId,
    action: 'admin.operation_rejected',
    metadata: { reason, ...(extra ?? {}) },
  })
}

// ─────────────────────────────────────────────────────────────────────────
// Lookups compartidos (siempre con supabaseAdmin — ver nota de diseño en
// CONTEXT.md: se necesita distinguir "no existe" de "no está en tu alcance",
// algo que RLS no puede dar directamente).
// ─────────────────────────────────────────────────────────────────────────

async function getProfileById(admin: any, id: string): Promise<TargetProfile | null> {
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, display_name, role, status, organization_id')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

async function getOrganizationById(admin: any, id: string): Promise<Organization | null> {
  const { data, error } = await admin
    .from('organizations')
    .select('id, name, code, status, assigned_seller_id')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

async function vendorOwnsOrganization(admin: any, vendorId: string, organizationId: string): Promise<boolean> {
  const { data, error } = await admin
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('assigned_seller_id', vendorId)
    .maybeSingle()
  if (error) throw error
  return !!data
}

async function countActiveOwnersExcluding(admin: any, excludeId: string): Promise<number> {
  const { count, error } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'owner')
    .eq('status', 'activo')
    .neq('id', excludeId)
  if (error) throw error
  return count ?? 0
}

async function countAssignedOrganizations(admin: any, sellerId: string): Promise<number> {
  const { count, error } = await admin
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .eq('assigned_seller_id', sellerId)
  if (error) throw error
  return count ?? 0
}

// ─────────────────────────────────────────────────────────────────────────
// Acciones
// ─────────────────────────────────────────────────────────────────────────

async function handleCreateOrganization(admin: any, actor: ActorProfile, payload: Payload): Promise<Response> {
  if (actor.role !== 'owner') {
    await rejected(admin, actor.id, 'create_organization: solo owner')
    return fail(403, 'Solo el owner puede crear organizaciones.', 'forbidden')
  }

  const name = readTrimmedString(payload, 'name', 2, 160)
  if (!name) return fail(400, 'El nombre de la organización debe tener entre 2 y 160 caracteres.', 'invalid_payload')

  let code: string | null = null
  if (payload.code !== undefined && payload.code !== null) {
    code = readTrimmedString(payload, 'code', 1, 40)
    if (!code) return fail(400, 'El código de la organización no es válido.', 'invalid_payload')
  }

  const { data, error } = await admin
    .from('organizations')
    .insert({ name, code, status: 'activo' })
    .select('id, name, code, status, assigned_seller_id')
    .single()

  if (error) {
    if (pgErrorCode(error) === '23505') {
      return fail(409, 'Ya existe una organización con ese código.', 'duplicate_code')
    }
    console.error('[admin-portal] create_organization failed:', error.message)
    return fail(500, 'No se pudo crear la organización.', 'internal_error')
  }

  await logAudit(admin, {
    actorUserId: actor.id,
    action: 'organization.created',
    targetType: 'organization',
    targetId: data.id,
    metadata: { name, code },
  })

  return ok({ organization: data }, 201)
}

async function handleUpdateOrganization(admin: any, actor: ActorProfile, payload: Payload): Promise<Response> {
  if (actor.role !== 'owner') {
    await rejected(admin, actor.id, 'update_organization: solo owner')
    return fail(403, 'Solo el owner puede editar organizaciones.', 'forbidden')
  }

  const organizationId = readUuid(payload, 'organization_id')
  if (!organizationId) {
    return fail(400, 'organization_id inválido.', 'invalid_payload')
  }

  const existing = await getOrganizationById(admin, organizationId)
  if (!existing) return fail(404, 'Organización no encontrada.', 'not_found')

  const update: Record<string, unknown> = {}

  if (payload.name !== undefined) {
    const name = readTrimmedString(payload, 'name', 2, 160)
    if (!name) return fail(400, 'El nombre de la organización debe tener entre 2 y 160 caracteres.', 'invalid_payload')
    update.name = name
  }
  if (payload.code !== undefined) {
    if (payload.code === null) {
      update.code = null
    } else {
      const code = readTrimmedString(payload, 'code', 1, 40)
      if (!code) return fail(400, 'El código de la organización no es válido.', 'invalid_payload')
      update.code = code
    }
  }
  if (payload.status !== undefined) {
    const status = readAccountStatus(payload, 'status')
    if (!status) return fail(400, 'Estado inválido.', 'invalid_payload')
    update.status = status
  }

  if (Object.keys(update).length === 0) {
    return fail(400, 'No se envió ningún campo para actualizar.', 'invalid_payload')
  }

  const { data, error } = await admin
    .from('organizations')
    .update(update)
    .eq('id', existing.id)
    .select('id, name, code, status, assigned_seller_id')
    .single()

  if (error) {
    if (pgErrorCode(error) === '23505') {
      return fail(409, 'Ya existe una organización con ese código.', 'duplicate_code')
    }
    console.error('[admin-portal] update_organization failed:', error.message)
    return fail(500, 'No se pudo actualizar la organización.', 'internal_error')
  }

  await logAudit(admin, {
    actorUserId: actor.id,
    action: 'organization.updated',
    targetType: 'organization',
    targetId: existing.id,
    metadata: { changed: Object.keys(update) },
  })

  return ok({ organization: data })
}

async function handleAssignSeller(admin: any, actor: ActorProfile, payload: Payload): Promise<Response> {
  if (actor.role !== 'owner') {
    await rejected(admin, actor.id, 'assign_seller: solo owner')
    return fail(403, 'Solo el owner puede asignar vendedores.', 'forbidden')
  }

  const organizationId = readUuid(payload, 'organization_id')
  if (!organizationId) {
    return fail(400, 'organization_id inválido.', 'invalid_payload')
  }
  if (!('seller_id' in payload)) {
    return fail(400, 'Falta seller_id (usá null para desasignar).', 'invalid_payload')
  }

  const org = await getOrganizationById(admin, organizationId)
  if (!org) return fail(404, 'Organización no encontrada.', 'not_found')

  let sellerId: string | null = null
  if (payload.seller_id !== null) {
    const candidateSellerId = readUuid(payload, 'seller_id')
    if (!candidateSellerId) return fail(400, 'seller_id inválido.', 'invalid_payload')
    const seller = await getProfileById(admin, candidateSellerId)
    if (!seller) return fail(404, 'Vendedor no encontrado.', 'not_found')
    if (seller.role !== 'vendedor' || seller.status !== 'activo') {
      return fail(400, 'El vendedor asignado debe tener rol vendedor y estar activo.', 'invalid_seller')
    }
    sellerId = seller.id
  }

  const { data, error } = await admin
    .from('organizations')
    .update({ assigned_seller_id: sellerId })
    .eq('id', org.id)
    .select('id, name, code, status, assigned_seller_id')
    .single()

  if (error) {
    // Red de seguridad de prevent_invalid_seller_assignment (migración
    // 202608030002, sección 5) — puede dispararse aunque el pre-check de
    // arriba haya pasado, si el vendedor cambió de estado justo en el medio
    // (perdedor de la carrera que serializa lock_seller_guard). Es un
    // conflicto de negocio real, no un error interno: 409, no 500.
    if (pgErrorCode(error) === '23514' && extractPgTag(error) === 'invalid_seller') {
      return fail(409, 'El vendedor asignado debe tener rol vendedor y estar activo.', 'invalid_seller')
    }
    console.error('[admin-portal] assign_seller failed:', error.message)
    return fail(500, 'No se pudo asignar el vendedor.', 'internal_error')
  }

  await logAudit(admin, {
    actorUserId: actor.id,
    action: 'organization.seller_assigned',
    targetType: 'organization',
    targetId: org.id,
    metadata: { seller_id: sellerId },
  })

  return ok({ organization: data })
}

async function handleInviteUser(admin: any, actor: ActorProfile, payload: Payload): Promise<Response> {
  const email = readEmail(payload, 'email')
  if (!email) return fail(400, 'Email inválido.', 'invalid_payload')

  const displayName = readTrimmedString(payload, 'display_name', 2, 120)
  if (!displayName) return fail(400, 'El nombre debe tener entre 2 y 120 caracteres.', 'invalid_payload')

  if (payload.role === 'owner') {
    await rejected(admin, actor.id, 'invite_user: intento de crear owner', { email })
    return fail(400, 'No se pueden crear cuentas owner desde esta interfaz.', 'owner_creation_forbidden')
  }
  const role = readPortalRole(payload, 'role')
  if (!role) {
    return fail(400, 'El rol debe ser "vendedor" o "usuario".', 'invalid_payload')
  }

  let organizationId: string | null = null

  if (actor.role === 'owner') {
    if (role === 'vendedor') {
      if (payload.organization_id !== undefined && payload.organization_id !== null) {
        return fail(400, 'organization_id debe ser null para invitar un vendedor.', 'invalid_payload')
      }
    } else {
      // role === 'usuario'
      const orgId = readUuid(payload, 'organization_id')
      if (!orgId) {
        return fail(400, 'organization_id es obligatorio para invitar una credencial de mayorista.', 'invalid_payload')
      }
      organizationId = orgId
    }
  } else if (actor.role === 'vendedor') {
    if (role === 'vendedor') {
      await rejected(admin, actor.id, 'invite_user: vendedor intentó invitar vendedor')
      return fail(403, 'Un vendedor no puede invitar otros vendedores.', 'forbidden')
    }
    const orgId = readUuid(payload, 'organization_id')
    if (!orgId) {
      return fail(400, 'organization_id es obligatorio para invitar una credencial de mayorista.', 'invalid_payload')
    }
    const assigned = await vendorOwnsOrganization(admin, actor.id, orgId)
    if (!assigned) {
      await rejected(admin, actor.id, 'invite_user: organización no asignada', {
        organization_id: orgId,
      })
      return fail(403, 'Esa organización no está asignada a tu cuenta.', 'forbidden')
    }
    organizationId = orgId
  } else {
    await rejected(admin, actor.id, 'invite_user: rol sin permiso')
    return fail(403, 'No tenés permisos para invitar cuentas.', 'forbidden')
  }

  if (role === 'usuario') {
    const org = await getOrganizationById(admin, organizationId as string)
    if (!org) return fail(404, 'Organización no encontrada.', 'not_found')
    if (org.status !== 'activo') {
      return fail(409, 'La organización está inactiva — activala antes de invitar una credencial.', 'organization_inactive')
    }

    const { data: existingActive, error: existingErr } = await admin
      .from('profiles')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('role', 'usuario')
      .eq('status', 'activo')
      .maybeSingle()
    if (existingErr) throw existingErr
    if (existingActive) {
      return fail(409, 'Ya existe una credencial activa para esta organización.', 'duplicate_active_credential')
    }
  }

  const baseUrl = getPortalBaseUrl()
  if (!baseUrl) {
    console.error('[admin-portal] PORTAL_BASE_URL no configurada o inválida')
    return fail(500, 'Configuración de redirección no disponible. Contactá al equipo técnico.', 'misconfigured')
  }

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName },
    redirectTo: baseUrl,
  })

  if (inviteError || !inviteData?.user) {
    const msg = (inviteError?.message || '').toLowerCase()
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      return fail(409, 'Ya existe una cuenta con ese email.', 'duplicate_email')
    }
    console.error('[admin-portal] inviteUserByEmail failed:', inviteError?.message)
    return fail(500, 'No se pudo enviar la invitación.', 'internal_error')
  }

  const newUserId = inviteData.user.id

  const { data: updatedProfile, error: updateError } = await admin
    .from('profiles')
    .update({
      display_name: displayName,
      role,
      organization_id: organizationId,
      created_by: actor.id,
      status: 'activo',
    })
    .eq('id', newUserId)
    .select('id, email, display_name, role, status, organization_id')
    .single()

  if (updateError) {
    // Compensar: no dejar una cuenta Auth activa sin perfil configurado.
    const { error: deleteError } = await admin.auth.admin.deleteUser(newUserId)
    if (deleteError) {
      console.error('[admin-portal] compensating deleteUser failed:', newUserId, deleteError.message)
    }
    console.error('[admin-portal] post-invite profile update failed:', newUserId, updateError.message)

    if (pgErrorCode(updateError) === '23505') {
      return fail(409, 'Ya existe una credencial activa para esta organización.', 'duplicate_active_credential')
    }
    return fail(500, 'No se pudo completar la invitación. Intentá nuevamente.', 'internal_error')
  }

  await logAudit(admin, {
    actorUserId: actor.id,
    action: 'user.invited',
    targetType: 'profile',
    targetId: newUserId,
    metadata: { email, role, organization_id: organizationId, display_name: displayName },
  })

  return ok({ profile: updatedProfile }, 201)
}

async function handleUpdateProfile(admin: any, actor: ActorProfile, payload: Payload): Promise<Response> {
  const profileId = readUuid(payload, 'profile_id')
  if (!profileId) return fail(400, 'profile_id inválido.', 'invalid_payload')
  const displayName = readTrimmedString(payload, 'display_name', 2, 120)
  if (!displayName) return fail(400, 'El nombre debe tener entre 2 y 120 caracteres.', 'invalid_payload')

  const target = await getProfileById(admin, profileId)
  if (!target) return fail(404, 'Cuenta no encontrada.', 'not_found')

  if (actor.role === 'vendedor') {
    if (target.role !== 'usuario' || !target.organization_id || !(await vendorOwnsOrganization(admin, actor.id, target.organization_id))) {
      await rejected(admin, actor.id, 'update_profile: fuera de alcance', { target_id: target.id })
      return fail(403, 'No tenés permisos sobre esta cuenta.', 'forbidden')
    }
  } else if (actor.role !== 'owner') {
    await rejected(admin, actor.id, 'update_profile: rol sin permiso')
    return fail(403, 'No tenés permisos para editar cuentas.', 'forbidden')
  }

  const { data, error } = await admin
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', target.id)
    .select('id, email, display_name, role, status, organization_id')
    .single()

  if (error) {
    console.error('[admin-portal] update_profile failed:', error.message)
    return fail(500, 'No se pudo actualizar la cuenta.', 'internal_error')
  }

  await logAudit(admin, {
    actorUserId: actor.id,
    action: 'user.profile_updated',
    targetType: 'profile',
    targetId: target.id,
    metadata: { display_name: displayName },
  })

  return ok({ profile: data })
}

async function handleSetAccountStatus(admin: any, actor: ActorProfile, payload: Payload): Promise<Response> {
  const profileId = readUuid(payload, 'profile_id')
  if (!profileId) return fail(400, 'profile_id inválido.', 'invalid_payload')
  const status = readAccountStatus(payload, 'status')
  if (!status) return fail(400, 'status debe ser "activo" o "inactivo".', 'invalid_payload')

  const target = await getProfileById(admin, profileId)
  if (!target) return fail(404, 'Cuenta no encontrada.', 'not_found')

  if (target.id === actor.id) {
    await rejected(admin, actor.id, 'set_account_status: intento de auto-modificación')
    return fail(403, 'No podés cambiar el estado de tu propia cuenta.', 'forbidden')
  }

  if (actor.role === 'vendedor') {
    if (target.role !== 'usuario' || !target.organization_id || !(await vendorOwnsOrganization(admin, actor.id, target.organization_id))) {
      await rejected(admin, actor.id, 'set_account_status: fuera de alcance', { target_id: target.id })
      return fail(403, 'No tenés permisos sobre esta cuenta.', 'forbidden')
    }
  } else if (actor.role !== 'owner') {
    await rejected(admin, actor.id, 'set_account_status: rol sin permiso')
    return fail(403, 'No tenés permisos para cambiar el estado de cuentas.', 'forbidden')
  }

  if (target.role === 'owner' && target.status === 'activo' && status !== 'activo') {
    const remaining = await countActiveOwnersExcluding(admin, target.id)
    if (remaining === 0) {
      await rejected(admin, actor.id, 'set_account_status: último owner activo', { target_id: target.id })
      return fail(403, 'No se puede desactivar al último owner activo del portal.', 'last_owner_protected')
    }
  }

  // Un vendedor con clientes (organizaciones) asignados no se puede
  // desactivar sin antes reasignar/desasignar esas organizaciones — si no,
  // quedan "huérfanas" apuntando a un vendedor que ya no puede operarlas.
  // No se desasigna automáticamente: es una decisión explícita del owner.
  if (target.role === 'vendedor' && target.status === 'activo' && status !== 'activo') {
    const assignedCount = await countAssignedOrganizations(admin, target.id)
    if (assignedCount > 0) {
      await rejected(admin, actor.id, 'set_account_status: vendedor con clientes asignados', {
        target_id: target.id,
        assigned_count: assignedCount,
      })
      return fail(
        409,
        'Este vendedor todavía tiene organizaciones asignadas — reasigná o desasigná sus clientes antes de desactivarlo.',
        'seller_still_assigned',
      )
    }
  }

  // Una credencial `usuario` no puede quedar activa si su organización no
  // existe o está inactiva (si no, "desactivar organización" no revoca
  // acceso real en cuanto alguien reactive la credencial a mano). Aplica
  // por igual a owner y vendedor — ninguno de los dos puede saltarse esto.
  if (target.role === 'usuario' && status === 'activo') {
    const targetOrg = target.organization_id ? await getOrganizationById(admin, target.organization_id) : null
    if (!targetOrg || targetOrg.status !== 'activo') {
      await rejected(admin, actor.id, 'set_account_status: organización inactiva', {
        target_id: target.id,
        organization_id: target.organization_id,
      })
      return fail(409, 'No se puede activar esta cuenta porque su organización está inactiva.', 'organization_inactive')
    }
  }

  const { data, error } = await admin
    .from('profiles')
    .update({ status })
    .eq('id', target.id)
    .select('id, email, display_name, role, status, organization_id')
    .single()

  if (error) {
    // Red de seguridad de los triggers de base (ver migración
    // 202608030002) — los tres usan errcode 23514; se distinguen por el tag
    // `[codigo_estable]` al inicio del mensaje (ver extractPgTag), no por
    // texto libre, porque cubren casos de negocio distintos y cada uno
    // necesita su propio código/mensaje al frontend.
    if (pgErrorCode(error) === '23514') {
      const tag = extractPgTag(error)
      if (tag === 'seller_still_assigned') {
        return fail(
          409,
          'Este vendedor todavía tiene organizaciones asignadas — reasigná o desasigná sus clientes antes de desactivarlo.',
          'seller_still_assigned',
        )
      }
      if (tag === 'organization_inactive') {
        return fail(409, 'No se puede activar esta cuenta porque su organización está inactiva.', 'organization_inactive')
      }
      if (tag === 'last_owner_protected') {
        return fail(403, 'No se puede desactivar al último owner activo del portal.', 'last_owner_protected')
      }
      // Tag desconocido o ausente — igual es una violación de una regla de
      // integridad de negocio (23514), no un error interno: 409 genérico,
      // no 500.
      console.error('[admin-portal] set_account_status unexpected 23514:', error.message)
      return fail(409, 'La operación entra en conflicto con una regla de integridad del portal.', 'constraint_violation')
    }
    console.error('[admin-portal] set_account_status failed:', error.message)
    return fail(500, 'No se pudo actualizar el estado de la cuenta.', 'internal_error')
  }

  await logAudit(admin, {
    actorUserId: actor.id,
    action: status === 'activo' ? 'user.activated' : 'user.deactivated',
    targetType: 'profile',
    targetId: target.id,
    metadata: { previous_status: target.status },
  })

  return ok({ profile: data })
}

async function handleSendPasswordReset(admin: any, actor: ActorProfile, payload: Payload): Promise<Response> {
  const profileId = readUuid(payload, 'profile_id')
  if (!profileId) return fail(400, 'profile_id inválido.', 'invalid_payload')

  const target = await getProfileById(admin, profileId)
  if (!target) return fail(404, 'Cuenta no encontrada.', 'not_found')

  if (actor.role === 'vendedor') {
    if (target.role !== 'usuario' || !target.organization_id || !(await vendorOwnsOrganization(admin, actor.id, target.organization_id))) {
      await rejected(admin, actor.id, 'send_password_reset: fuera de alcance', { target_id: target.id })
      return fail(403, 'No tenés permisos sobre esta cuenta.', 'forbidden')
    }
  } else if (actor.role !== 'owner') {
    await rejected(admin, actor.id, 'send_password_reset: rol sin permiso')
    return fail(403, 'No tenés permisos para enviar recuperación de contraseña.', 'forbidden')
  }

  const baseUrl = getPortalBaseUrl()
  if (!baseUrl) {
    console.error('[admin-portal] PORTAL_BASE_URL no configurada o inválida')
    return fail(500, 'Configuración de redirección no disponible. Contactá al equipo técnico.', 'misconfigured')
  }

  const { error } = await admin.auth.resetPasswordForEmail(target.email, { redirectTo: baseUrl })
  if (error) {
    console.error('[admin-portal] resetPasswordForEmail failed:', error.message)
    return fail(500, 'No se pudo enviar el correo de recuperación.', 'internal_error')
  }

  await logAudit(admin, {
    actorUserId: actor.id,
    action: 'user.password_reset_requested',
    targetType: 'profile',
    targetId: target.id,
  })

  return ok({ ok: true })
}

// ─────────────────────────────────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────────────────────────────────

const ACTIONS: Record<string, (admin: any, actor: ActorProfile, payload: Payload) => Promise<Response>> = {
  create_organization: handleCreateOrganization,
  update_organization: handleUpdateOrganization,
  assign_seller: handleAssignSeller,
  invite_user: handleInviteUser,
  update_profile: handleUpdateProfile,
  set_account_status: handleSetAccountStatus,
  send_password_reset: handleSendPasswordReset,
}

export default {
  fetch: withSupabase({ auth: 'user', cors: 'default' }, async (req: Request, ctx: any) => {
    // 1. Método HTTP
    if (req.method !== 'POST') {
      return fail(400, 'Método no soportado — usá POST.', 'invalid_method')
    }

    // 2. Autenticación ya validada por withSupabase (401 automático si
    //    falta o es inválido el JWT). ctx.userClaims.id es el actor.
    const authUserId = ctx.userClaims?.id as string | undefined
    if (!authUserId) {
      return fail(401, 'Sesión inválida.', 'unauthenticated')
    }

    // 3. Body
    let body: AdminRequestBody
    try {
      body = await req.json()
    } catch {
      return fail(400, 'JSON inválido.', 'invalid_json')
    }

    const action = typeof body.action === 'string' ? body.action : null
    const payload: Payload =
      typeof body.payload === 'object' && body.payload !== null && !Array.isArray(body.payload)
        ? (body.payload as Payload)
        : {}

    // Object.hasOwn (no "in") — "in" recorre la cadena de prototipos, así
    // que un payload como {"action":"toString"} pasaría "'toString' in
    // ACTIONS" como true (ACTIONS es un objeto literal, hereda de
    // Object.prototype). hasOwn solo mira propiedades propias.
    if (!action || !Object.hasOwn(ACTIONS, action)) {
      return fail(400, 'Acción no reconocida.', 'invalid_action')
    }

    try {
      // 4. Perfil del actor — lectura RLS-scoped (id = auth.uid() siempre
      //    permitido por la policy profiles_select_allowed de Fase 1).
      const { data: actorProfile, error: actorError } = await ctx.supabase
        .from('profiles')
        .select('id, role, status, organization_id')
        .eq('id', authUserId)
        .maybeSingle()

      if (actorError) throw actorError

      if (!actorProfile) {
        return fail(403, 'Tu cuenta no tiene un perfil configurado.', 'no_profile')
      }

      const actor = actorProfile as ActorProfile

      // 5. El actor debe estar activo EN ESTE MOMENTO, no según lo que
      //    diga el JWT/localStorage del cliente.
      if (actor.status !== 'activo') {
        return fail(403, 'Tu cuenta está inactiva.', 'inactive_account')
      }

      // 6. Solo owner/vendedor llegan a operar Administración. `usuario`
      //    nunca pasa de acá, sin importar qué acción haya pedido.
      if (actor.role !== 'owner' && actor.role !== 'vendedor') {
        await rejected(ctx.supabaseAdmin, actor.id, 'acceso a admin-portal sin rol autorizado', { action })
        return fail(403, 'No tenés acceso a Administración.', 'forbidden')
      }

      // 7. Payload con whitelist + 8. Ejecutar la operación (cada acción
      //    valida su propio payload y arma su propia respuesta).
      return await ACTIONS[action](ctx.supabaseAdmin, actor, payload)
    } catch (unexpectedError) {
      // Nunca reenviar el error crudo al cliente (stack trace, detalles
      // internos de Postgres, etc.) — solo queda en los logs de la función.
      console.error('[admin-portal] unexpected error:', action, (unexpectedError as Error)?.message)
      return fail(500, 'Ocurrió un error inesperado. Intentá nuevamente.', 'internal_error')
    }
  }),
}
