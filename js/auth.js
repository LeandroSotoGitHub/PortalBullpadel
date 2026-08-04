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
  const roleLabels = { owner:'Owner', vendedor:'Vendedor', usuario:'Distribuidor' };
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
  return /type=(recovery|invite)/.test(raw) && /(access_token=|code=)/.test(raw);
}

async function _showPasswordSetupScreen() {
  const loginScreen   = document.getElementById('login-screen');
  const pwdSetupScreen = document.getElementById('password-setup-screen');
  const errEl          = document.getElementById('pwdsetup-error');
  const form            = document.getElementById('pwdsetup-form');
  const emailEl         = document.getElementById('pwdsetup-email');

  // Limpiar la URL ya — evita reprocesar el link si se recarga la página.
  // La librería ya leyó window.location al crear el cliente (síncrono, en
  // js/supabase-config.js), así que esto no interfiere con esa lectura.
  window.history.replaceState(null, '', window.location.pathname);

  loginScreen.classList.add('hidden');
  pwdSetupScreen.classList.remove('hidden');
  _pwdSetupEmail = null;
  if (emailEl) {
    emailEl.textContent = '';
    emailEl.classList.remove('visible');
  }

  if (!supabaseClient) {
    errEl.textContent = 'El servicio de acceso no está disponible en este momento.';
    errEl.classList.add('visible');
    form.style.display = 'none';
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (!data || !data.session) {
      errEl.textContent = 'El enlace no es válido o ya expiró. Pedí uno nuevo.';
      errEl.classList.add('visible');
      form.style.display = 'none';
    } else {
      // El email sale exclusivamente de la sesión que Supabase ya
      // estableció a partir del link (data.session.user.email) — nunca de
      // un query param ni de nada que pueda enviar el cliente.
      _pwdSetupEmail = data.session.user && data.session.user.email ? data.session.user.email : null;
      if (emailEl && _pwdSetupEmail) {
        emailEl.textContent = `Esta contraseña quedará asociada a: ${_pwdSetupEmail}`;
        emailEl.classList.add('visible');
      }
    }
  } catch (error) {
    console.error('[Auth] Error al validar el enlace de invitación/recuperación:', error.message);
    errEl.textContent = 'El enlace no es válido o ya expiró. Pedí uno nuevo.';
    errEl.classList.add('visible');
    form.style.display = 'none';
  }

  _subscribeAuthStateChange();
}

// ── Mensajes de error al configurar contraseña ──────────────────────────────
// Igual que classifyInviteError en supabase/functions/admin-portal/index.ts:
// se clasifica por `.code`/`.status` (contrato estable del SDK de Auth), NO
// por texto de `.message` — evita el mismo problema que se encontró antes
// (mensaje genérico de rate limit mostrado ante un error real de "misma
// contraseña que la anterior").
function _setPasswordErrorMessage(error) {
  const code   = error && error.code;
  const status = error && error.status;

  if (code === 'same_password') {
    return 'La nueva contraseña debe ser distinta de la anterior.';
  }
  if (code === 'weak_password') {
    return 'Esa contraseña es demasiado débil. Elegí una más segura, combinando letras, números y símbolos.';
  }
  if (code === 'session_not_found' || code === 'bad_jwt' || code === 'jwt_expired' || code === 'otp_expired') {
    return 'El enlace expiró o ya no es válido. Pedí uno nuevo desde Administración.';
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
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
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
    mountPortal();
  } catch (error) {
    console.error('[Auth] Error al restaurar sesión:', error.message);
    try { await supabaseClient.auth.signOut(); } catch (e) { /* sesión ya inválida */ }
    loginScreen.classList.remove('hidden');
  }

  _subscribeAuthStateChange();
}
