// Portal Bullpadel — receptor de eventos transaccionales de Brevo.
//
// Esta función es pública a nivel de gateway porque Brevo no posee un JWT de
// Supabase. Cada llamada debe incluir el bearer configurado en
// BREVO_WEBHOOK_TOKEN. Solo procesa destinatarios que ya existen en
// portal_access_status y nunca conserva el payload crudo.
import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

type JsonRecord = Record<string, unknown>

const POSITIVE_STAGE: Record<string, 'invitation_sent' | 'delivered' | 'opened'> = {
  request: 'invitation_sent',
  sent: 'invitation_sent',
  delivered: 'delivered',
  opened: 'opened',
  unique_opened: 'opened',
  uniqueopened: 'opened',
  click: 'opened',
  clicked: 'opened',
}

const ERROR_EVENTS = new Set([
  'hard_bounce',
  'hardbounce',
  'soft_bounce',
  'softbounce',
  'blocked',
  'spam',
  'invalid',
  'invalid_email',
  'deferred',
  'error',
])

const STAGE_RANK: Record<string, number> = {
  invitation_sent: 1,
  delivered: 2,
  opened: 3,
}

const DEFAULT_SUBJECT_MARKERS = [
  'tu acceso al portal bullpadel',
  'acceso al portal bullpadel',
  'invitacion al portal bullpadel',
  'configura tu contrasena',
  'restablece tu contrasena',
]

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export function normalizeText(value: unknown): string {
  return typeof value === 'string'
    ? value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : ''
}

export function normalizeEvent(value: unknown): string {
  return normalizeText(value).replace(/[\s-]+/g, '_')
}

export function normalizeEmail(value: unknown): string | null {
  const email = normalizeText(value)
  if (!email || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

function subjectMarkers(): string[] {
  const configured = Deno.env.get('PORTAL_EMAIL_SUBJECT_MARKERS')
  if (!configured) return DEFAULT_SUBJECT_MARKERS
  const markers = configured.split(';').map(normalizeText).filter(Boolean)
  return markers.length ? markers : DEFAULT_SUBJECT_MARKERS
}

export function isPortalAccessEmail(payload: JsonRecord): boolean {
  const subject = normalizeText(payload.subject)
  return Boolean(subject && subjectMarkers().some((marker) => subject.includes(marker)))
}

export function eventTimestamp(payload: JsonRecord): Date {
  const epochSeconds = Number(payload.ts_event ?? payload.ts)
  if (Number.isFinite(epochSeconds) && epochSeconds > 0) return new Date(epochSeconds * 1000)

  const epochMilliseconds = Number(payload.ts_epoch)
  if (Number.isFinite(epochMilliseconds) && epochMilliseconds > 0) {
    return new Date(epochMilliseconds > 10_000_000_000 ? epochMilliseconds : epochMilliseconds * 1000)
  }

  if (typeof payload.date === 'string') {
    const parsed = new Date(payload.date)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  return new Date()
}

function bearerToken(req: Request): string {
  const header = req.headers.get('authorization') ?? ''
  return header.replace(/^Bearer\s+/i, '').trim()
}

export function safeEqual(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function processEvent(admin: any, payload: JsonRecord): Promise<'processed' | 'ignored'> {
  const email = normalizeEmail(payload.email)
  const eventType = normalizeEvent(payload.event)

  if (!email || (!POSITIVE_STAGE[eventType] && !ERROR_EVENTS.has(eventType))) return 'ignored'
  if (!isPortalAccessEmail(payload)) return 'ignored'

  const { data: current, error: readError } = await admin
    .from('portal_access_status')
    .select('profile_id, email_stage, email_stage_at, email_error_at')
    .eq('email', email)
    .maybeSingle()

  if (readError) throw readError
  if (!current) return 'ignored'

  const occurredAt = eventTimestamp(payload)
  const occurredAtIso = occurredAt.toISOString()
  const changes: Record<string, unknown> = {}

  const positiveStage = POSITIVE_STAGE[eventType]
  if (positiveStage) {
    const currentRank = STAGE_RANK[current.email_stage] ?? 0
    const incomingRank = STAGE_RANK[positiveStage]
    const currentStageAt = current.email_stage_at ? new Date(current.email_stage_at) : null

    if (
      incomingRank > currentRank ||
      (incomingRank === currentRank && (!currentStageAt || occurredAt > currentStageAt))
    ) {
      changes.email_stage = positiveStage
      changes.email_stage_at = occurredAtIso
    }
  } else {
    const currentErrorAt = current.email_error_at ? new Date(current.email_error_at) : null
    if (!currentErrorAt || occurredAt > currentErrorAt) {
      changes.email_error_code = eventType
      changes.email_error_at = occurredAtIso
    }
  }

  if (Object.keys(changes).length) {
    const { error: updateError } = await admin
      .from('portal_access_status')
      .update(changes)
      .eq('profile_id', current.profile_id)
    if (updateError) throw updateError
  }

  const messageIdRaw = payload['message-id'] ?? payload.messageId ?? null
  const messageId = typeof messageIdRaw === 'string' ? messageIdRaw.slice(0, 500) : null
  const eventKey = await sha256(`${messageId ?? 'no-message-id'}|${eventType}|${occurredAtIso}|${email}`)
  const { error: eventError } = await admin.from('portal_email_events').insert({
    event_key: eventKey,
    email,
    event_type: eventType,
    message_id: messageId,
    occurred_at: occurredAtIso,
  })

  if (eventError && eventError.code !== '23505') {
    console.error(JSON.stringify({
      event: 'brevo_event_log_failed',
      eventKey: eventKey.slice(0, 16),
      errorCode: eventError.code ?? null,
    }))
  }

  return 'processed'
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const expectedToken = Deno.env.get('BREVO_WEBHOOK_TOKEN') ?? ''
  if (!safeEqual(bearerToken(req), expectedToken)) {
    return json({ error: 'unauthorized' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(JSON.stringify({ event: 'brevo_webhook_missing_runtime_config' }))
    return json({ error: 'misconfigured' }, 500)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const events: JsonRecord[] = (Array.isArray(body) ? body : [body])
    .filter((item): item is JsonRecord => typeof item === 'object' && item !== null && !Array.isArray(item))

  if (!events.length || events.length > 100) return json({ error: 'invalid_payload' }, 400)

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let processed = 0
  let ignored = 0
  try {
    for (const event of events) {
      const result = await processEvent(admin, event)
      if (result === 'processed') processed += 1
      else ignored += 1
    }
  } catch (error) {
    console.error(JSON.stringify({
      event: 'brevo_webhook_processing_failed',
      errorCode: (error as { code?: string })?.code ?? null,
    }))
    return json({ error: 'processing_failed' }, 500)
  }

  return json({ ok: true, processed, ignored })
}

if (import.meta.main) Deno.serve(handleRequest)
