const USERS_KEY = 'bp_users_2026';

// ── Persistencia ────────────────────────────────────────────────────────────

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedUsers() {
  // Solo inicializar si no existe todavía en localStorage
  if (!getUsers()) {
    saveUsers(JSON.parse(JSON.stringify(USUARIOS)));
  }
}

// ── CRUD ────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'bp_session_2026';


function saveSession(user) {
  // Guardamos sin password en localStorage
  const safe = { id:user.id, nombre:user.nombre, email:user.email,
                 rol:user.rol, clienteMayorista:user.clienteMayorista };
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  currentUser = safe;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
}

// ── Login handler ─────────────────────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  errEl.classList.remove('visible');
  errEl.textContent = '';

  // Find user — always read from localStorage (getUsers) so new users can login
  const allUsers = getUsers() || USUARIOS;
  const user = allUsers.find(u => u.email.toLowerCase() === email);

  if (!user || user.password !== password) {
    errEl.textContent = 'Email o contraseña incorrectos. Verificá tus credenciales.';
    errEl.classList.add('visible');
    return;
  }

  if (user.estado !== 'activo') {
    errEl.textContent = 'Tu usuario se encuentra inactivo. Contactá al equipo Bullpadel.';
    errEl.classList.add('visible');
    return;
  }

  // Success
  saveSession(user);
  mountPortal();
}

// ── Logout handler ────────────────────────────────────────────────────────
function handleLogout() {
  clearSession();
  // Reset login form
  document.getElementById('login-email').value    = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.remove('visible');
  // Show login, hide portal
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('session-bar').style.display = 'none';
  // Hide nav and main
  document.querySelector('.nav-bar').style.display = 'none';
  document.querySelector('.main').style.display    = 'none';
  document.querySelector('.header').style.background = 'var(--negro)';
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

  // Init portal renders (only on first mount)
  if (!window._portalMounted) {
    renderPalas();
    renderItems();
    populateCompSelects();
    renderComp();
    renderTabla();
    renderGuia();
    renderCapacitaciones();
    window._portalMounted = true;
  }
  // Always re-render admin when mounting (reflects latest users)
  renderAdmin();
  // Render home stats
  renderHomeStats();
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

  // Map nav button text → permission key
  const navMap = [
    { text: 'Inicio',          perm: 'verCatalogo' },
    { text: 'Catálogo',        perm: 'verCatalogo' },
    { text: 'Recomendador',    perm: 'verRecomendador' },
    { text: 'Comparador',      perm: 'verComparador' },
    { text: 'Capacitaciones',  perm: 'verCapacitaciones' },
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
      tabla:'verTablaGama', guia:'verGuiaVenta', capacitaciones:'verCapacitaciones'
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

// ── Init auth on page load ────────────────────────────────────────────────
function initAuth() {
  // Seed localStorage with base users if first time
  seedUsers();

  // Hide nav and main until logged in
  document.querySelector('.nav-bar').style.display = 'none';
  document.querySelector('.main').style.display    = 'none';

  // Check for existing session
  const saved = loadSession();
  if (saved) {
    // Verify user still exists and is active in localStorage
    const lsUsers = getUsers() || USUARIOS;
    const user = lsUsers.find(u => u.id === saved.id && u.estado === 'activo');
    if (user) {
      currentUser = saved;
      mountPortal();
      return;
    } else {
      clearSession();
    }
  }

  // No valid session — show login
  document.getElementById('login-screen').classList.remove('hidden');
}
