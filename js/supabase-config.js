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
