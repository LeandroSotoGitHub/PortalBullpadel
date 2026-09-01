import {
  eventTimestamp,
  isPortalAccessEmail,
  normalizeEmail,
  normalizeEvent,
  safeEqual as webhookSafeEqual,
} from '../functions/brevo-webhook/index.ts'
import {
  displayStatus,
  safeEqual as exportSafeEqual,
} from '../functions/sheet-status-export/index.ts'

function assertEquals(actual: unknown, expected: unknown): void {
  if (actual !== expected) {
    throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
}

Deno.test('normaliza emails y rechaza formatos inválidos', () => {
  assertEquals(normalizeEmail(' Cliente@Ejemplo.com '), 'cliente@ejemplo.com')
  assertEquals(normalizeEmail('sin-arroba'), null)
})

Deno.test('normaliza aliases de eventos de Brevo', () => {
  assertEquals(normalizeEvent('First Opening'), 'first_opening')
  assertEquals(normalizeEvent('hard-bounce'), 'hard_bounce')
})

Deno.test('acepta solo asuntos relacionados con acceso al portal', () => {
  assertEquals(isPortalAccessEmail({ subject: 'Tu acceso al Portal Bullpadel 2026' }), true)
  assertEquals(isPortalAccessEmail({ subject: 'Configurá tu contraseña' }), true)
  assertEquals(isPortalAccessEmail({ subject: 'Novedades comerciales de agosto' }), false)
})

Deno.test('prioriza ingreso, error vigente y avance positivo', () => {
  assertEquals(displayStatus({ last_portal_login_at: '2026-08-28T10:00:00Z' }), 'Ingresó al portal')
  assertEquals(displayStatus({
    email_stage: 'delivered',
    email_stage_at: '2026-08-28T09:00:00Z',
    email_error_at: '2026-08-28T09:30:00Z',
  }), 'Error de entrega')
  assertEquals(displayStatus({
    email_stage: 'opened',
    email_stage_at: '2026-08-28T10:00:00Z',
    email_error_at: '2026-08-28T09:30:00Z',
  }), 'Abierto')
})

Deno.test('interpreta timestamps en segundos', () => {
  assertEquals(eventTimestamp({ ts_event: 1_787_911_200 }).toISOString(), '2026-08-28T10:00:00.000Z')
})

Deno.test('compara tokens sin aceptar parciales', () => {
  assertEquals(webhookSafeEqual('abc123', 'abc123'), true)
  assertEquals(webhookSafeEqual('abc123', 'abc124'), false)
  assertEquals(webhookSafeEqual('abc', 'abcdef'), false)
  assertEquals(exportSafeEqual('token-seguro', 'token-seguro'), true)
})
