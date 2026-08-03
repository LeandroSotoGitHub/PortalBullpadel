// -- ADMIN . gestión de usuarios --------------------------------------------
// DESHABILITADO TEMPORALMENTE (RUN Supabase Auth — Fase 1, 2026-08-03).
//
// El CRUD local contra localStorage se eliminó junto con la migración a
// Supabase Auth (ver js/auth.js, js/data.js). No se mantiene como fallback
// porque sería inseguro y confuso: el cliente ya no tiene ninguna fuente de
// usuarios propia.
//
// Todas las funciones de este archivo son no-op hasta la próxima run, que
// reemplazará este panel por una función de servidor segura (Supabase RPC /
// función administrativa), sin supabase.auth.admin en el navegador y sin
// altas de usuarios desde el cliente.
//
// El botón "Administración" del nav permanece oculto para los tres roles
// (ver applyRolePermissions() en js/auth.js e index.html). Estas funciones
// solo actúan de red de seguridad por si algo llega a invocarlas manualmente.

function renderAdmin() {
  const restricted = document.getElementById('admin-restricted');
  const content    = document.getElementById('admin-content');
  if (restricted) restricted.style.display = 'block';
  if (content)    content.style.display    = 'none';
}

function adminShowAlert() {}

function adminCloseModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function adminToggleForm() {}
function adminUpdateMayoristaHint() {}

function adminCreateUser(e) { if (e) e.preventDefault(); }
function adminOpenEdit() {}
function adminSaveEdit(e) { if (e) e.preventDefault(); }
function adminOpenPwd() {}
function adminSavePwd(e) { if (e) e.preventDefault(); }
function adminToggleStatus() {}
function adminDelete() {}

/* ── Password visibility toggle — sigue en uso por el login ── */

function togglePwdVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Ocultar' : 'Ver';
}
