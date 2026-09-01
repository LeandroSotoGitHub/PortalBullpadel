// Portal Bullpadel — export mínimo y de solo lectura para Google Sheets.
//
// La función no expone ids, nombres, organizaciones ni actividad detallada:
// devuelve únicamente email normalizado, estado calculado y fecha de cambio.
import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
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

export function displayStatus(row: Record<string, unknown>): string {
  if (row.last_portal_login_at) return 'Ingresó al portal'

  const stageAt = row.email_stage_at ? new Date(String(row.email_stage_at)) : null
  const errorAt = row.email_error_at ? new Date(String(row.email_error_at)) : null
  if (errorAt && (!stageAt || errorAt > stageAt)) return 'Error de entrega'

  if (row.email_stage === 'opened') return 'Abierto'
  if (row.email_stage === 'delivered') return 'Entregado'
  return 'Invitación enviada'
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const expectedToken = Deno.env.get('SHEET_SYNC_TOKEN') ?? ''
  if (!safeEqual(bearerToken(req), expectedToken)) {
    return json({ error: 'unauthorized' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(JSON.stringify({ event: 'sheet_status_export_missing_runtime_config' }))
    return json({ error: 'misconfigured' }, 500)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await admin
    .from('portal_access_status')
    .select('email, email_stage, email_stage_at, email_error_at, last_portal_login_at, updated_at')
    .order('email', { ascending: true })

  if (error) {
    console.error(JSON.stringify({
      event: 'sheet_status_export_query_failed',
      errorCode: error.code ?? null,
    }))
    return json({ error: 'query_failed' }, 500)
  }

  return json({
    generated_at: new Date().toISOString(),
    accounts: (data ?? []).map((row) => ({
      email: row.email,
      status: displayStatus(row),
      updated_at: row.updated_at,
    })),
  })
}

if (import.meta.main) Deno.serve(handleRequest)
