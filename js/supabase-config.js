// -- SUPABASE CONFIG ---------------------------------------------------------
// Cliente único de Supabase para todo el portal (RUN Fase 1 — Auth).
//
// Dependencia: @supabase/supabase-js, cargada vía CDN en index.html
// (versión fijada 2.112.0, rama 2.x — no usar "@latest"). Ese <script> debe
// ir antes que este archivo, y este archivo antes que js/auth.js.
//
// La URL y la publishable key son públicas a propósito: la autorización real
// vive en las políticas RLS de Supabase (ver supabase/migrations/), no en el
// cliente. Nunca agregar acá la secret key, el service_role ni ninguna clave
// privilegiada.

const SUPABASE_URL = 'https://zzvdrnwotxrgvncbsaez.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_gkum-0xJyrW6tODLAn2RbQ_Ai6h-FIF';

// Capturar la intención del enlace ANTES de crear el cliente. Supabase
// procesa los parámetros de Auth durante su inicialización y puede limpiar
// `window.location` antes de que initAuth() se ejecute (especialmente en
// navegadores móviles). Guardamos únicamente indicadores booleanos: nunca
// persistimos ni copiamos access_token, refresh_token, code u otros secretos.
const SUPABASE_AUTH_REDIRECT = (() => {
  const searchParams = new URLSearchParams(window.location.search || '');
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const authType = searchParams.get('type') || hashParams.get('type');
  const hasCredential =
    searchParams.has('code') ||
    searchParams.has('access_token') ||
    hashParams.has('code') ||
    hashParams.has('access_token');
  const hasAuthError =
    searchParams.has('error') ||
    searchParams.has('error_code') ||
    hashParams.has('error') ||
    hashParams.has('error_code');

  return Object.freeze({
    // Los redirects PKCE de Supabase pueden volver solo con `?code=...`, sin
    // conservar `type=invite|recovery`. El portal no usa OAuth/social login,
    // por lo que un code de Auth siempre pertenece a estos dos flujos.
    isPasswordSetup:
      (hasCredential && (authType === 'invite' || authType === 'recovery')) ||
      searchParams.has('code') ||
      hashParams.has('code'),
    hasAuthError,
  });
})();

// ¿Había una sesión guardada ANTES de abrir esta página? Se lee acá y no en
// js/auth.js porque createClient() pisa esta clave con la sesión nueva apenas
// se inicializa, si el enlace de la URL trae un code válido. Después ya no hay
// forma de saberlo.
//
// Para qué sirve: cuando llega un `?code=` que NO sirve (vencido, ya usado o
// inválido) y existía una sesión previa, el intercambio falla en silencio y
// getSession() devuelve la sesión vieja. Sin este dato, el portal ofrecería
// configurar la contraseña de esa cuenta ajena — el caso real es una máquina
// compartida en el mostrador. Ver _showPasswordSetupScreen() en js/auth.js.
//
// Guarda un booleano y nada más: nunca el token ni ningún dato de la sesión.
const SUPABASE_HAD_SESSION_BEFORE_LOAD = (() => {
  try {
    // Misma convención de clave que usa supabase-js: sb-<project-ref>-auth-token.
    // Se deriva de SUPABASE_URL para que siga valiendo si cambia el proyecto.
    const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
    return window.localStorage.getItem(`sb-${projectRef}-auth-token`) !== null;
  } catch (e) {
    // localStorage bloqueado (incógnito, cookies de terceros deshabilitadas).
    // Degradar a `false` es lo correcto: se comporta como antes de este cambio.
    return false;
  }
})();

let supabaseClient = null;

if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
  console.error('[Supabase] Librería @supabase/supabase-js no disponible. Verificá que el <script> del CDN esté cargado antes de js/supabase-config.js en index.html.');
} else {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // RUN Fase 2 (Administración): true a partir de acá — necesario para
      // que los links de invitación/recuperación de contraseña (que
      // vuelven al portal con un token en la URL) establezcan sesión. La
      // detección de "esta carga de página viene de un link de invitación/
      // recuperación" NO depende de esto — se hace leyendo la URL cruda de
      // forma temprana en js/auth.js, porque un link de invitación dispara
      // el mismo evento SIGNED_IN que un login normal (Supabase solo emite
      // un evento distinto, PASSWORD_RECOVERY, para recuperación — no para
      // invitación). Ver _checkPasswordSetupLink() en js/auth.js.
      detectSessionInUrl: true
    }
  });
}
