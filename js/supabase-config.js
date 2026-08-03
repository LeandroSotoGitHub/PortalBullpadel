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
      detectSessionInUrl: false
    }
  });
}
