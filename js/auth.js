// -- AUTENTICACIÓN . Supabase Auth ------------------------------------------
// RUN Fase 1: reemplaza el login local/demo por Supabase Auth. Depende de
// `supabaseClient`, creado en js/supabase-config.js (debe cargarse antes que
// este archivo). La sesión persiste en el almacenamiento interno de Supabase
// (ya no hay ninguna clave propia de sesión/usuarios en localStorage).
//
// Administración queda deshabilitada temporalmente (ver js/admin.js): no se
// llama a renderAdmin() desde mountPortal() y el botón de nav está oculto.

let _authStateSubscribed = false;

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
  // Administración deshabilitada temporalmente — no se renderiza (ver js/admin.js)

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
  // "Administración" queda fuera a propósito: el botón permanece oculto
  // (ver index.html) hasta que exista una función de servidor segura.
  const navMap = [
    { text: 'Inicio',          perm: 'verCatalogo' },
    { text: 'Catálogo',        perm: 'verCatalogo' },
    { text: 'Recomendador',    perm: 'verRecomendador' },
    { text: 'Comparador',      perm: 'verComparador' },
    { text: 'Capacitaciones',  perm: 'verCapacitaciones' },
    { text: 'Media Center',    perm: 'verMediaCenter' },
  ];

  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.id === 'nav-admin') return; // oculto temporalmente, no reintroducir
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
