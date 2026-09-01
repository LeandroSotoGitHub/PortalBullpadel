// -- AUTENTICACIÓN . Supabase Auth ------------------------------------------
// RUN Fase 1: reemplaza el login local/demo por Supabase Auth. Depende de
// `supabaseClient`, creado en js/supabase-config.js (debe cargarse antes que
// este archivo). La sesión persiste en el almacenamiento interno de Supabase
// (ya no hay ninguna clave propia de sesión/usuarios en localStorage).
//
// RUN Fase 2: Administración está activa para owner/vendedor (ver
// js/admin.js). renderAdmin() es lazy — se dispara desde showSection('admin')
// en js/eventos.js, no desde acá.

let _authStateSubscribed = false;

// Email de la sesión transitoria de invitación/recuperación — se captura una
// sola vez en _showPasswordSetupScreen() (desde data.session.user.email,
// nunca desde query params ni desde nada que envíe el cliente) y se
// conserva en memoria para reusarlo después de guardar la contraseña, ya
// que en ese punto la sesión transitoria se cierra (signOut) y dejaría de
// estar disponible para leerla de nuevo.
let _pwdSetupEmail = null;

const AUTH_SESSION_TIMEOUT_MS = 10000;

async function _getSessionWithTimeout(timeoutMs = AUTH_SESSION_TIMEOUT_MS) {
  let timeoutId = null;
  try {
    return await Promise.race([
      supabaseClient.auth.getSession(),
      new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutError = new Error('La validación de la sesión demoró demasiado.');
          timeoutError.code = 'session_timeout';
          reject(timeoutError);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== null) clearTimeout(timeoutId);
  }
}

// ── Mensajes de error en español ────────────────────────────────────────────
function _authErrorMessage(error) {
  const msg = ((error && error.message) || '').toLowerCase();
  if (msg.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos. Verificá tus credenciales.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Tu cuenta todavía no fue confirmada. Contactá al equipo Bullpadel.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
  }
  return 'No pudimos iniciar sesión en este momento. Intentá nuevamente en unos minutos.';
}

// ── Perfil ───────────────────────────────────────────────────────────────
async function _fetchProfile(userId) {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, email, display_name, role, status, organization_id')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function _fetchOrganizationName(organizationId) {
  if (!organizationId) return null;
  const { data, error } = await supabaseClient
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .maybeSingle();
  if (error || !data) return null;
  return data.name;
}

// Mapea el perfil de Supabase a la forma que espera el resto del portal.
async function _buildCurrentUser(authUser, profile) {
  const clienteMayorista = await _fetchOrganizationName(profile.organization_id);
  const nombre = (profile.display_name || '').trim();
  return {
    id: profile.id,
    nombre: nombre || profile.email || authUser.email,
    email: profile.email || authUser.email,
    rol: profile.role,
    clienteMayorista: clienteMayorista,
    organizationId: profile.organization_id || null
  };
}

// Observabilidad best-effort: registra que la cuenta efectivamente llegó al
// portal después de un login válido. La RPC deriva el usuario de auth.uid() y
// no acepta ids/emails del navegador. Nunca se espera este request para montar
// la interfaz, de modo que una caída del seguimiento no puede bloquear acceso.
async function _recordPortalLogin() {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.rpc('record_own_portal_login');
    if (error) throw error;
  } catch (error) {
    console.warn('[Auth] No se pudo registrar la actividad de acceso:', error && error.code ? error.code : 'unknown');
  }
}

// ── Login handler ──────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const pwdInput    = document.getElementById('login-password');
  const errEl       = document.getElementById('login-error');
  const submitBtn   = e.target.querySelector('button[type="submit"]');

  const email    = emailInput.value.trim().toLowerCase();
  const password = pwdInput.value;

  errEl.classList.remove('visible');
  errEl.textContent = '';

  if (!supabaseClient) {
    errEl.textContent = 'El servicio de acceso no está disponible en este momento. Contactá al equipo Bullpadel.';
    errEl.classList.add('visible');
    return;
  }

  if (submitBtn) submitBtn.disabled = true;

  try {
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (signInError || !signInData || !signInData.user) {
      errEl.textContent = _authErrorMessage(signInError);
      errEl.classList.add('visible');
      return;
    }

    let profile;
    try {
      profile = await _fetchProfile(signInData.user.id);
    } catch (profileError) {
      console.error('[Auth] Error al consultar perfil:', profileError.message);
      await supabaseClient.auth.signOut();
      errEl.textContent = 'No pudimos verificar tu cuenta. Intentá nuevamente en unos minutos.';
      errEl.classList.add('visible');
      return;
    }

    if (!profile) {
      await supabaseClient.auth.signOut();
      errEl.textContent = 'Tu cuenta todavía no fue configurada. Contactá al equipo Bullpadel.';
      errEl.classList.add('visible');
      return;
    }

    if (profile.status !== 'activo') {
      await supabaseClient.auth.signOut();
      errEl.textContent = 'Tu usuario se encuentra inactivo. Contactá al equipo Bullpadel.';
      errEl.classList.add('visible');
      return;
    }

    currentUser = await _buildCurrentUser(signInData.user, profile);
    void _recordPortalLogin();
    pwdInput.value = '';
    mountPortal();
  } catch (unexpectedError) {
    console.error('[Auth] Error inesperado en login:', unexpectedError.message);
    errEl.textContent = 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.';
    errEl.classList.add('visible');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ── Logout ──────────────────────────────────────────────────────────────
// No llama a supabase.auth.signOut() — la usan tanto handleLogout() como el
// listener de onAuthStateChange, y este solo resetea el estado visual.
function _resetPortalUI() {
  currentUser = null;

  if (typeof closeOnboarding === 'function') closeOnboarding(false);
  if (typeof closeLightbox === 'function') closeLightbox();
  if (typeof closeDetailModal === 'function') closeDetailModal();
  if (typeof closePalaModal === 'function') closePalaModal();
  document.querySelectorAll('.admin-modal-bg.open').forEach(m => m.classList.remove('open'));

  // Aislamiento entre sesiones: ninguna respuesta/resultado/selección/
  // progreso en memoria de la cuenta que cierra sesión debe sobrevivir para
  // la próxima cuenta que inicie sesión en esta misma pestaña.
  if (typeof clearPreviousSessionState === 'function') clearPreviousSessionState();

  const emailInput = document.getElementById('login-email');
  const pwdInput    = document.getElementById('login-password');
  if (emailInput) emailInput.value = '';
  if (pwdInput) pwdInput.value = '';
  const errEl = document.getElementById('login-error');
  if (errEl) errEl.classList.remove('visible');

  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('session-bar').style.display = 'none';
  document.querySelector('.nav-bar').style.display = 'none';
  document.querySelector('.main').style.display    = 'none';
  document.querySelector('.header').style.background = 'var(--negro)';
}

async function handleLogout() {
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error('[Auth] Error al cerrar sesión:', error.message);
    }
  }
  _resetPortalUI();
}

// ── Mount portal after login ──────────────────────────────────────────────
function mountPortal() {
  if (!currentUser) return;

  // Hide login screen
  document.getElementById('login-screen').classList.add('hidden');

  // Show nav and main
  document.querySelector('.nav-bar').style.display = '';
  document.querySelector('.main').style.display    = '';

  // Update session bar
  const initials = currentUser.nombre.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('session-avatar').textContent  = initials;
  document.getElementById('session-name').textContent    = currentUser.nombre;
  const roleEl = document.getElementById('session-role-badge');
  const roleLabels = { owner:'Owner', vendedor:'Vendedor', usuario:'Punto de Venta' };
  roleEl.textContent  = roleLabels[currentUser.rol] || currentUser.rol;
  roleEl.className    = 'session-role ' + currentUser.rol;
  document.getElementById('session-bar').style.display = 'flex';

  // Apply role-based nav visibility
  applyRolePermissions();

  // Renders estáticos — no dependen de currentUser, se ejecutan una sola vez
  // por carga de página (los datos que muestran no cambian entre logins).
  if (!window._portalMounted) {
    renderPalas();
    renderItems();
    populateCompSelects();
    renderComp();
    renderTabla();
    renderGuia();
    renderMediaCenter();
    window._portalMounted = true;
  }
  // Administración (RUN Fase 2) NO se renderiza acá — es lazy, disparada por
  // showSection('admin') (ver js/eventos.js), igual que Mapa competitivo.
  // Evita consultar Supabase en cada login para roles que nunca abren el
  // panel.

  // Renders dependientes del usuario — deben actualizarse en CADA login,
  // no solo en el primer montaje: leen localStorage namespaced por
  // currentUser.id (progreso/checklist/quiz, ver js/capacitaciones.js) o
  // permisos por rol. Si no se re-ejecutan acá, una segunda cuenta que
  // inicia sesión en la misma pestaña vería el progreso de la primera.
  renderCapacitaciones();
  renderHomeStats();
  renderHomeQuickAccess();
  // Mount catalogo and guia tabs into subviews (synchronous — runs once)
  _mountCatalogoTab('palas');
  _mountCatalogoTab('tabla');
  _mountCatalogoTab('glosario');
  _mountGuiaTab();
  // Show onboarding on first visit
  if (!hasSeenOnboarding()) {
    setTimeout(openOnboarding, 400);
  }
}

// ── Role-based nav visibility ─────────────────────────────────────────────
function applyRolePermissions() {
  if (!currentUser) return;
  const perms = ROLES[currentUser.rol]?.permisos || {};

  // Map nav button text → permission key.
  // "Administración" (RUN Fase 2): visible para owner/vendedor vía
  // verAdminPanel (ROLES en js/data.js). Es solo UX — la autoridad real es
  // la Edge Function admin-portal + RLS (ver js/admin.js), que rechazan la
  // operación aunque alguien reactive el botón a mano.
  const navMap = [
    { text: 'Inicio',          perm: 'verCatalogo' },
    { text: 'Catálogo',        perm: 'verCatalogo' },
    { text: 'Recomendador',    perm: 'verRecomendador' },
    { text: 'Comparador',      perm: 'verComparador' },
    { text: 'Capacitaciones',  perm: 'verCapacitaciones' },
    { text: 'Media Center',    perm: 'verMediaCenter' },
    { text: 'Administración',  perm: 'verAdminPanel' },
  ];

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const entry = navMap.find(m => btn.textContent.trim() === m.text);
    if (entry) {
      btn.style.display = perms[entry.perm] !== false ? '' : 'none';
    }
  });

  // Mapa competitivo: solo visible para owner/vendedor (perm verCompetencia)
  const mapaTabBtn = [...document.querySelectorAll('#subnav-comparador .subnav-btn')]
    .find(b => b.textContent.trim() === 'Mapa competitivo');
  if (mapaTabBtn) {
    const puedeVerMapa = perms.verCompetencia !== false;
    mapaTabBtn.style.display = puedeVerMapa ? '' : 'none';
    // Si el usuario sin permiso quedó parado en la tab Mapa, volver a Comparador Bullpadel
    if (!puedeVerMapa) {
      const mapaTabPanel = document.getElementById('comparador-tab-mapa');
      if (mapaTabPanel && mapaTabPanel.classList.contains('active')) {
        showComparadorTab('bullpadel', null);
      }
    }
  }

  // If active section is hidden, switch to first visible
  const activeSection = document.querySelector('.section.visible');
  if (activeSection) {
    const secId = activeSection.id.replace('sec-','');
    const secMap = {
      palas:'verCatalogo', glosario:'verMateriales', comparador:'verComparador',
      tabla:'verTablaGama', guia:'verGuiaVenta', capacitaciones:'verCapacitaciones',
      'media-center':'verMediaCenter'
    };
    if (perms[secMap[secId]] === false) {
      // Show first permitted section
      const firstAllowed = navMap.find(m => perms[m.perm] !== false);
      if (firstAllowed) {
        const firstBtn = [...document.querySelectorAll('.nav-btn')]
          .find(b => b.textContent.trim() === firstAllowed.text);
        if (firstBtn) firstBtn.click();
      }
    }
  }
}

// ── Configurar contraseña (invitación / recuperación) ──────────────────────
// Un link de invitación o de recuperación de Supabase vuelve al portal con
// un token en la URL (hash `#access_token=...&type=invite|recovery` o query
// `?code=...&type=invite|recovery`, según el flow). detectSessionInUrl:true
// (js/supabase-config.js) ya establece la sesión automáticamente; acá solo
// se detecta el caso para NO montar el portal con esa sesión transitoria —
// hay que pedir contraseña nueva primero.
//
// Importante: Supabase solo distingue un evento propio para recuperación
// (PASSWORD_RECOVERY); un link de INVITACIÓN dispara el mismo SIGNED_IN que
// un login normal. Por eso la detección se hace leyendo la URL cruda, no el
// evento de onAuthStateChange — si dependiera del evento, una invitación
// terminaría montando el portal sin haber configurado contraseña.
function _isPasswordSetupLink() {
  const raw = (window.location.hash || '') + ' ' + (window.location.search || '');
  const capturedRedirect = typeof SUPABASE_AUTH_REDIRECT !== 'undefined'
    ? SUPABASE_AUTH_REDIRECT
    : null;

  return Boolean(
    (capturedRedirect && (capturedRedirect.isPasswordSetup || capturedRedirect.hasAuthError)) ||
    (/type=(recovery|invite)/.test(raw) && /(access_token=|code=)/.test(raw)) ||
    /[?&#]code=/.test(raw)
  );
}

function _clearAuthRedirectUrl() {
  // Quitar tokens/códigos del historial solo DESPUÉS de que getSession()
  // haya esperado la inicialización de Supabase. Limpiarlos antes abre una
  // condición de carrera en móviles y puede perder la sesión transitoria.
  window.history.replaceState(null, '', window.location.pathname);
}

function _showPasswordSetupLinkError(message, title) {
  const form = document.getElementById('pwdsetup-form');
  const panel = document.getElementById('pwdsetup-link-error');
  const messageEl = document.getElementById('pwdsetup-link-error-message');
  const titleEl = document.querySelector('.pwdsetup-link-error-title');

  if (form) form.style.display = 'none';
  if (messageEl) messageEl.textContent = message;
  // Sin `title` se conserva el del markup ("No pudimos validar el enlace"),
  // correcto para un enlace que nunca sirvió. handleSetPassword() pasa uno
  // propio: ahí el enlace SÍ era válido y venció durante el uso.
  if (titleEl && title) titleEl.textContent = title;
  if (panel) panel.classList.add('visible');
}

function returnToPortalFromPasswordSetup() {
  _clearAuthRedirectUrl();
  window.location.reload();
}

async function _showPasswordSetupScreen() {
  const loginScreen   = document.getElementById('login-screen');
  const pwdSetupScreen = document.getElementById('password-setup-screen');
  const errEl          = document.getElementById('pwdsetup-error');
  const form            = document.getElementById('pwdsetup-form');
  const emailEl         = document.getElementById('pwdsetup-email');
  const linkErrorEl     = document.getElementById('pwdsetup-link-error');

  loginScreen.classList.add('hidden');
  pwdSetupScreen.classList.remove('hidden');
  const confirmEl = document.getElementById('pwdsetup-confirm-identity');
  if (confirmEl) confirmEl.classList.add('hidden');
  form.style.display = '';
  errEl.textContent = '';
  errEl.classList.remove('visible');
  if (linkErrorEl) linkErrorEl.classList.remove('visible');
  _pwdSetupEmail = null;
  if (emailEl) {
    emailEl.textContent = '';
    emailEl.classList.remove('visible');
  }

  // Un redirect que ya volvió con error (por ejemplo, OTP vencido o link
  // reutilizado) nunca debe aprovechar una sesión previa del navegador. Sin
  // este corte, getSession() podría devolver la cuenta que ya estaba abierta
  // y ofrecer cambiarle la contraseña aunque el enlace recibido sea inválido.
  const capturedRedirect = typeof SUPABASE_AUTH_REDIRECT !== 'undefined'
    ? SUPABASE_AUTH_REDIRECT
    : null;
  if (capturedRedirect && capturedRedirect.hasAuthError) {
    _showPasswordSetupLinkError(
      'El enlace no es válido, ya expiró o fue utilizado anteriormente. Solicitá un nuevo correo y abrilo directamente en Chrome o Safari.'
    );
    _clearAuthRedirectUrl();
    _subscribeAuthStateChange();
    return;
  }

  if (!supabaseClient) {
    _clearAuthRedirectUrl();
    _showPasswordSetupLinkError(
      'El servicio de acceso no está disponible en este momento. Volvé al portal e intentá nuevamente más tarde.'
    );
    return;
  }

  try {
    const { data, error } = await _getSessionWithTimeout();
    if (error) throw error;
    if (!data || !data.session) {
      _showPasswordSetupLinkError(
        'No pudimos iniciar la configuración. El enlace puede haber expirado o haberse abierto desde un navegador interno. Solicitá uno nuevo y abrilo directamente en Chrome o Safari.'
      );
    } else {
      // El email sale exclusivamente de la sesión que Supabase ya
      // estableció a partir del link (data.session.user.email) — nunca de
      // un query param ni de nada que pueda enviar el cliente.
      _pwdSetupEmail = data.session.user && data.session.user.email ? data.session.user.email : null;
      if (emailEl && _pwdSetupEmail) {
        emailEl.textContent = `Esta contraseña quedará asociada a: ${_pwdSetupEmail}`;
        emailEl.classList.add('visible');
      }

      // Si ya había una sesión guardada antes de abrir esta página, esta
      // sesión puede NO venir del enlace: un `code` vencido, ya usado o
      // inválido falla en silencio y getSession() devuelve la sesión previa.
      // El portal ofrecería entonces cambiarle la contraseña a esa cuenta —
      // el caso real es una máquina compartida donde A quedó logueada y B
      // abre su propio enlace ya vencido.
      //
      // No se intenta averiguar si el enlace autenticó (frágil, y obligaría a
      // tocar detectSessionInUrl, que es lo único que hace funcionar todo el
      // flujo). Se resuelve preguntando: se nombra la cuenta y se exige una
      // decisión explícita antes de mostrar el formulario.
      const hadPreviousSession = typeof SUPABASE_HAD_SESSION_BEFORE_LOAD !== 'undefined'
        && SUPABASE_HAD_SESSION_BEFORE_LOAD;
      if (hadPreviousSession) {
        _showPasswordSetupIdentityCheck();
      }
    }
  } catch (error) {
    console.error('[Auth] Error al validar el enlace de invitación/recuperación:', error.message);
    const message = error && error.code === 'session_timeout'
      ? 'La validación está demorando más de lo esperado. Revisá tu conexión, volvé al portal y abrí nuevamente el enlace desde Chrome o Safari.'
      : 'El enlace no es válido o ya expiró. Solicitá uno nuevo y abrilo directamente en Chrome o Safari.';
    _showPasswordSetupLinkError(message);
  } finally {
    _clearAuthRedirectUrl();
  }

  _subscribeAuthStateChange();
}

// ── Confirmación de identidad ───────────────────────────────────────────────
// Solo se usa cuando existía una sesión previa al abrir el enlace (ver la
// nota en _showPasswordSetupScreen). Es una defensa contra la confusión, no
// contra un atacante: no hay apropiación de cuenta posible por esta vía. Por
// eso alcanza con nombrar la cuenta y pedir una decisión explícita.
function _showPasswordSetupIdentityCheck() {
  const panel = document.getElementById('pwdsetup-confirm-identity');
  const emailEl = document.getElementById('pwdsetup-confirm-email');
  const form = document.getElementById('pwdsetup-form');
  const inlineEmail = document.getElementById('pwdsetup-email');

  if (!panel) return;
  if (emailEl) emailEl.textContent = _pwdSetupEmail || 'una cuenta ya iniciada en este navegador';
  // El email se muestra en el panel; repetirlo arriba sería redundante.
  if (inlineEmail) inlineEmail.classList.remove('visible');
  if (form) form.style.display = 'none';
  panel.classList.remove('hidden');
}

function confirmPasswordSetupIdentity() {
  const panel = document.getElementById('pwdsetup-confirm-identity');
  const form = document.getElementById('pwdsetup-form');
  const inlineEmail = document.getElementById('pwdsetup-email');

  if (panel) panel.classList.add('hidden');
  if (form) form.style.display = '';
  if (inlineEmail && _pwdSetupEmail) inlineEmail.classList.add('visible');
}

// "No soy yo": cerrar la sesión ajena antes de ofrecer nada más, y recién
// entonces mostrar el panel de pedir un enlace nuevo. El campo de email queda
// vacío a propósito — la persona correcta tiene que escribir el suyo, no
// heredar el de quien estaba logueado.
async function rejectPasswordSetupIdentity() {
  const panel = document.getElementById('pwdsetup-confirm-identity');
  if (panel) panel.classList.add('hidden');

  _pwdSetupEmail = null;
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.error('[Auth] No se pudo cerrar la sesión previa:', e && e.message);
    }
  }

  _showPasswordSetupLinkError(
    'Cerramos la sesión que estaba abierta. Escribí tu email y te enviamos un enlace nuevo a tu nombre.',
    'Pedí un enlace para tu cuenta'
  );
  const resendInput = document.getElementById('pwdsetup-resend-email');
  if (resendInput) resendInput.value = '';
}

// ── Mensajes de error al configurar contraseña ──────────────────────────────
// Igual que classifyInviteError en supabase/functions/admin-portal/index.ts:
// se clasifica por `.code`/`.status` (contrato estable del SDK de Auth), NO
// por texto de `.message` — evita el mismo problema que se encontró antes
// (mensaje genérico de rate limit mostrado ante un error real de "misma
// contraseña que la anterior").
// Un error terminal significa que el enlace ya no sirve: reintentar el
// formulario no puede funcionar nunca. Se separa del resto porque cambia la
// pantalla, no solo el mensaje — ver handleSetPassword().
function _isTerminalLinkError(error) {
  const code = error && error.code;
  return code === 'session_not_found'
      || code === 'bad_jwt'
      || code === 'jwt_expired'
      || code === 'otp_expired';
}

function _setPasswordErrorMessage(error) {
  const code   = error && error.code;
  const status = error && error.status;

  if (code === 'same_password') {
    return 'La nueva contraseña debe ser distinta de la anterior.';
  }
  if (code === 'weak_password') {
    return 'Esa contraseña es demasiado débil. Elegí una más segura, combinando letras, números y símbolos.';
  }
  if (_isTerminalLinkError(error)) {
    return 'El enlace expiró mientras configurabas la contraseña. Pedí uno nuevo con el botón de abajo.';
  }
  if (code === 'over_request_rate_limit' || status === 429) {
    return 'Hiciste demasiados intentos. Esperá unos minutos antes de volver a intentarlo.';
  }
  // Desconocido: mensaje genérico correcto, sin afirmar que se va a
  // resolver "en unos minutos" — no sabemos la causa real.
  return 'No pudimos guardar la contraseña. Volvé a intentarlo y, si el problema continúa, contactá al equipo Bullpadel.';
}

// Log seguro: solo campos estables del contrato de AuthError. Nunca la
// contraseña ni ningún valor del formulario.
function _logSetPasswordError(error) {
  console.error('[Auth] Error al configurar contraseña:', {
    code: (error && error.code) || null,
    status: (error && error.status) || null,
    name: (error && error.name) || null,
    message: (error && error.message) || null,
  });
}

async function handleSetPassword(e) {
  e.preventDefault();
  const newPwd     = document.getElementById('pwdsetup-new').value;
  const confirmPwd = document.getElementById('pwdsetup-confirm').value;
  const errEl      = document.getElementById('pwdsetup-error');
  const successEl  = document.getElementById('pwdsetup-success');
  const submitBtn  = e.target.querySelector('button[type="submit"]');

  errEl.classList.remove('visible');
  errEl.textContent = '';
  successEl.classList.remove('visible');

  if (newPwd.length < 8) {
    errEl.textContent = 'La contraseña debe tener al menos 8 caracteres.';
    errEl.classList.add('visible');
    return;
  }
  if (newPwd !== confirmPwd) {
    errEl.textContent = 'Las contraseñas no coinciden.';
    errEl.classList.add('visible');
    return;
  }
  if (!supabaseClient) {
    errEl.textContent = 'El servicio de acceso no está disponible en este momento.';
    errEl.classList.add('visible');
    return;
  }

  if (submitBtn) submitBtn.disabled = true;

  try {
    const { error } = await supabaseClient.auth.updateUser({ password: newPwd });
    if (error) {
      _logSetPasswordError(error);

      // Enlace muerto: reintentar el formulario no puede funcionar. Se
      // cambia de pantalla al panel que ya existe, que sí ofrece salidas
      // (pedir un enlace nuevo / volver al portal). Sin esto la persona
      // quedaba con un formulario inservible y ningún botón.
      if (_isTerminalLinkError(error)) {
        _showPasswordSetupLinkError(
          _setPasswordErrorMessage(error),
          'El enlace dejó de ser válido'
        );
        // Precargar el email conocido — no hacérselo tipear de nuevo justo
        // después de perder el intento.
        const resendInput = document.getElementById('pwdsetup-resend-email');
        if (resendInput && _pwdSetupEmail) resendInput.value = _pwdSetupEmail;
        return;
      }

      // Recuperable (misma contraseña, contraseña débil, rate limit): el
      // enlace sigue vivo, así que se mantiene el formulario para reintentar.
      errEl.textContent = _setPasswordErrorMessage(error);
      errEl.classList.add('visible');
      return;
    }

    // El mensaje de éxito y el precargado del login usan _pwdSetupEmail,
    // capturado en _showPasswordSetupScreen() ANTES de este punto — acá
    // todavía no se hizo signOut(), pero ya no hace falta volver a leer la
    // sesión.
    successEl.textContent = _pwdSetupEmail
      ? `Contraseña configurada. Iniciá sesión con ${_pwdSetupEmail} y tu nueva contraseña.`
      : 'Contraseña configurada. Ya podés iniciar sesión con tu nueva contraseña.';
    successEl.classList.add('visible');
    document.getElementById('pwdsetup-form').style.display = 'none';

    // No montar el portal con esta sesión transitoria — pedir login normal.
    await supabaseClient.auth.signOut();

    // Precargar el email en el login normal — la persona no tiene que
    // volver a escribirlo ni adivinar cuál usar.
    const loginEmailInput = document.getElementById('login-email');
    if (loginEmailInput && _pwdSetupEmail) loginEmailInput.value = _pwdSetupEmail;

    setTimeout(() => {
      document.getElementById('password-setup-screen').classList.add('hidden');
      document.getElementById('login-screen').classList.remove('hidden');
    }, 1800);
  } catch (unexpectedError) {
    _logSetPasswordError(unexpectedError);
    errEl.textContent = 'Ocurrió un error inesperado. Volvé a intentarlo y, si el problema continúa, contactá al equipo Bullpadel.';
    errEl.classList.add('visible');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ── Solicitar un enlace nuevo de contraseña (auto-servicio) ────────────
// Hasta acá, un enlace vencido dejaba a la persona sin salida: había que
// reenviarlo a mano desde Administración. Esto llama al mismo endpoint
// /recover que usa admin-portal (resetPasswordForEmail), pero disparado por
// el propio usuario.
//
// El email se pide escrito a mano incluso en la pantalla de enlace inválido:
// un redirect con error vuelve SIN sesión, así que no hay forma de saber a
// quién pertenecía el enlace vencido (ver _showPasswordSetupScreen()).
//
// La respuesta al usuario es SIEMPRE la misma, exista o no la cuenta. Si
// dijera "ese email no está registrado", cualquiera podría ir probando
// direcciones para averiguar quién tiene acceso al portal.
const PASSWORD_LINK_TARGETS = {
  login:    { input: 'login-resend-email',    button: 'login-resend-btn',    status: 'login-resend-status' },
  pwdsetup: { input: 'pwdsetup-resend-email', button: 'pwdsetup-resend-btn', status: 'pwdsetup-resend-status' },
};

// Enfriamiento tras un envío exitoso. Protege el rate limit de envió de mails
// del proyecto (Authentication → Rate Limits) de alguien apretando el botón
// varias veces sin haber esperado el correo.
const PASSWORD_LINK_COOLDOWN_MS = 60000;

function _setPasswordLinkStatus(statusEl, message, kind) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove('ok', 'err');
  statusEl.classList.add(kind, 'visible');
}

// Mensajes por `.code`/`.status` del AuthError, no por texto de `.message`
// — mismo criterio que _setPasswordErrorMessage().
function _passwordLinkErrorMessage(error) {
  const code   = error && error.code;
  const status = error && error.status;

  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429) {
    return 'Ya se enviaron varios correos en los últimos minutos. Esperá un rato y volvé a intentarlo.';
  }
  if (code === 'validation_failed' || status === 400) {
    return 'Revisá que el email esté bien escrito.';
  }
  return 'No pudimos enviar el correo en este momento. Volvé a intentarlo y, si el problema continúa, contactá al equipo Bullpadel.';
}

function togglePasswordLinkRequest() {
  const panel  = document.getElementById('login-resend');
  const toggle = document.getElementById('login-forgot-toggle');
  if (!panel) return;

  const willOpen = panel.hidden;
  panel.hidden = !willOpen;
  if (toggle) toggle.setAttribute('aria-expanded', String(willOpen));
  if (!willOpen) return;

  // Reusar lo que la persona ya escribió arriba — no hacerla tipearlo dos veces.
  const loginEmail = document.getElementById('login-email');
  const resendEmail = document.getElementById('login-resend-email');
  if (resendEmail) {
    if (!resendEmail.value && loginEmail && loginEmail.value) resendEmail.value = loginEmail.value;
    resendEmail.focus();
  }
}

async function requestPasswordLink(target) {
  const ids = PASSWORD_LINK_TARGETS[target];
  if (!ids) return;

  const input    = document.getElementById(ids.input);
  const button   = document.getElementById(ids.button);
  const statusEl = document.getElementById(ids.status);
  if (!input) return;

  const email = (input.value || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    _setPasswordLinkStatus(statusEl, 'Escribí un email válido.', 'err');
    input.focus();
    return;
  }
  if (!supabaseClient) {
    _setPasswordLinkStatus(statusEl, 'El servicio de acceso no está disponible en este momento. Intentá más tarde.', 'err');
    return;
  }

  const originalLabel = button ? button.textContent : null;
  if (button) {
    button.disabled = true;
    button.textContent = 'Enviando…';
  }

  try {
    // redirectTo debe estar en Authentication → URL Configuration → Redirect
    // URLs del proyecto; si no, Supabase manda el enlace al Site URL.
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });

    if (error) {
      // Supabase NO devuelve error cuando el email no existe (responde 200
      // igual, a propósito). Así que un error acá es real — rate limit,
      // formato o falla del servicio — y mostrarlo no filtra nada.
      console.error('[Auth] Error al solicitar enlace de contraseña:', {
        code: error.code || null,
        status: error.status || null,
        name: error.name || null,
      });
      _setPasswordLinkStatus(statusEl, _passwordLinkErrorMessage(error), 'err');
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
      return;
    }

    _setPasswordLinkStatus(
      statusEl,
      'Si ese correo está registrado, te enviamos un enlace. Revisá tu bandeja de entrada y la carpeta de spam. Tenés 24 horas para usarlo, y abrilo directamente en Chrome o Safari.',
      'ok'
    );

    if (button) {
      button.textContent = 'Enlace enviado';
      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalLabel;
      }, PASSWORD_LINK_COOLDOWN_MS);
    }
  } catch (unexpectedError) {
    console.error('[Auth] Error inesperado al solicitar enlace de contraseña:', unexpectedError && unexpectedError.message);
    _setPasswordLinkStatus(statusEl, 'Ocurrió un error inesperado. Volvé a intentarlo en unos minutos.', 'err');
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }
}

// ── onAuthStateChange ──────────────────────────────────────────────────────
// Solo reacciona a un SIGNED_OUT (ej. token revocado/expirado en otra
// pestaña). No dispara mountPortal() acá — eso solo lo hacen handleLogin()
// e initAuth(), para evitar montajes duplicados del portal.
function _subscribeAuthStateChange() {
  if (_authStateSubscribed || !supabaseClient) return;
  _authStateSubscribed = true;
  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' && currentUser) {
      _resetPortalUI();
    }
  });
}

// ── Init auth on page load ────────────────────────────────────────────────
async function initAuth() {
  const loginScreen = document.getElementById('login-screen');
  const errEl       = document.getElementById('login-error');

  // Ocultar portal y navegación mientras se verifica la sesión
  document.querySelector('.nav-bar').style.display = 'none';
  document.querySelector('.main').style.display    = 'none';

  // Link de invitación/recuperación — no seguir con el flujo normal, no
  // montar el portal. Ver _showPasswordSetupScreen().
  if (_isPasswordSetupLink()) {
    await _showPasswordSetupScreen();
    return;
  }

  if (!supabaseClient) {
    if (errEl) {
      errEl.textContent = 'El servicio de acceso no está disponible en este momento. Contactá al equipo Bullpadel.';
      errEl.classList.add('visible');
    }
    loginScreen.classList.remove('hidden');
    return;
  }

  try {
    const { data: sessionData, error: sessionError } = await _getSessionWithTimeout();
    if (sessionError) throw sessionError;

    const session = sessionData && sessionData.session;
    if (!session) {
      loginScreen.classList.remove('hidden');
      _subscribeAuthStateChange();
      return;
    }

    const profile = await _fetchProfile(session.user.id);
    if (!profile || profile.status !== 'activo') {
      await supabaseClient.auth.signOut();
      loginScreen.classList.remove('hidden');
      _subscribeAuthStateChange();
      return;
    }

    currentUser = await _buildCurrentUser(session.user, profile);
    void _recordPortalLogin();
    mountPortal();
  } catch (error) {
    console.error('[Auth] Error al restaurar sesión:', error.message);
    try { await supabaseClient.auth.signOut(); } catch (e) { /* sesión ya inválida */ }
    loginScreen.classList.remove('hidden');
  }

  _subscribeAuthStateChange();
}
