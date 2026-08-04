// -- ADMIN . Administración segura (RUN Fase 2) ------------------------------
// Reemplaza los no-op de Fase 1. Los listados (organizaciones/cuentas/
// auditoría) son lecturas directas bajo RLS vía `supabaseClient` — el
// backend ya filtra por alcance (owner ve todo, vendedor solo lo asignado).
// TODA escritura privilegiada (crear/editar organización, asignar vendedor,
// invitar, activar/desactivar, recuperación de contraseña) pasa por la Edge
// Function `admin-portal` (supabase/functions/admin-portal/index.ts) vía
// `supabaseClient.functions.invoke()` — nunca se escribe directo a
// organizations/profiles/audit_logs desde acá, y nunca se usa
// `supabase.auth.admin` en el navegador.
//
// El botón "Administración" (nav-admin) y renderAdmin() son la capa de UX;
// la autoridad real vive en RLS + la Edge Function, que revalidan rol/
// estado/alcance en cada llamada aunque este archivo tenga un bug.

let _adminOrgs = [];
let _adminProfiles = [];
let _adminAuditLogs = [];
let _adminScope = null; // 'owner' | 'vendedor' | null

// ── Entry point ──────────────────────────────────────────────────────────

function renderAdmin() {
  const restricted = document.getElementById('admin-restricted');
  const content    = document.getElementById('admin-content');

  if (!currentUser) {
    if (restricted) restricted.style.display = 'block';
    if (content)    content.style.display    = 'none';
    return;
  }

  const perms = ROLES[currentUser.rol]?.permisos || {};
  if (!perms.verAdminPanel) {
    if (restricted) restricted.style.display = 'block';
    if (content)    content.style.display    = 'none';
    return;
  }

  restricted.style.display = 'none';
  content.style.display    = 'block';
  _adminScope = currentUser.rol; // 'owner' | 'vendedor' — usuario ya cortó arriba

  document.getElementById('btn-toggle-org-form').style.display = _adminScope === 'owner' ? '' : 'none';
  document.getElementById('admin-audit-card').style.display    = _adminScope === 'owner' ? '' : 'none';
  document.getElementById('inv-rol-wrap').style.display        = _adminScope === 'owner' ? '' : 'none';
  if (_adminScope === 'vendedor') {
    document.getElementById('inv-rol').value = 'usuario';
  }
  adminUpdateInviteOrgVisibility();

  _loadAdminData();
}

// ── Carga de datos (lecturas RLS-scoped) ────────────────────────────────────

async function _loadAdminData() {
  const loadingEl = document.getElementById('admin-loading');
  const errorEl   = document.getElementById('admin-error');
  loadingEl.style.display = 'block';
  errorEl.classList.remove('visible');

  if (!supabaseClient) {
    loadingEl.style.display = 'none';
    errorEl.textContent = 'El servicio no está disponible en este momento.';
    errorEl.classList.add('visible');
    return;
  }

  try {
    const [orgsRes, profilesRes] = await Promise.all([
      supabaseClient.from('organizations').select('id, name, code, status, assigned_seller_id').order('name'),
      supabaseClient.from('profiles').select('id, email, display_name, role, status, organization_id').order('email'),
    ]);

    if (orgsRes.error) throw orgsRes.error;
    if (profilesRes.error) throw profilesRes.error;

    _adminOrgs     = orgsRes.data || [];
    _adminProfiles = profilesRes.data || [];

    if (_adminScope === 'owner') {
      const auditRes = await supabaseClient
        .from('audit_logs')
        .select('id, action, actor_user_id, target_type, target_id, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (auditRes.error) throw auditRes.error;
      _adminAuditLogs = auditRes.data || [];
    } else {
      _adminAuditLogs = [];
    }

    loadingEl.style.display = 'none';
    _renderAdminStats();
    _renderAdminOrgs();
    _renderAdminInviteOptions();
    _renderAdminAccounts();
    _renderAdminAudit();
  } catch (error) {
    console.error('[Admin] Error al cargar datos:', error.message);
    loadingEl.style.display = 'none';
    errorEl.textContent = 'No pudimos cargar los datos de Administración. Probá de nuevo en unos minutos.';
    errorEl.classList.add('visible');
  }
}

// ── Render: stats ────────────────────────────────────────────────────────

function _renderAdminStats() {
  const el = document.getElementById('admin-stats');
  const stats = [
    { num: _adminOrgs.length,                                            label: 'Organizaciones' },
    { num: _adminOrgs.filter(o => o.status === 'activo').length,         label: 'Activas' },
    { num: _adminProfiles.length,                                        label: 'Cuentas' },
    { num: _adminProfiles.filter(p => p.status === 'activo').length,     label: 'Activas' },
  ];
  el.innerHTML = stats.map(s => `
    <div class="admin-stat">
      <div class="admin-stat-num">${s.num}</div>
      <div class="admin-stat-label">${s.label}</div>
    </div>`).join('');
}

// ── Render: organizaciones ──────────────────────────────────────────────

function _sellerLabel(sellerId) {
  if (!sellerId) return '—';
  const p = _adminProfiles.find(p => p.id === sellerId);
  return p ? escHtml(p.display_name || p.email) : 'Vendedor';
}

function _renderAdminOrgs() {
  const tbody = document.getElementById('admin-orgs-body');
  if (!_adminOrgs.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="admin-empty">No hay organizaciones para mostrar.</div></td></tr>';
    return;
  }
  const canManage = _adminScope === 'owner';
  tbody.innerHTML = _adminOrgs.map(o => {
    const estadoBadge = `<span class="badge badge-${o.status}">${o.status === 'activo' ? 'Activo' : 'Inactivo'}</span>`;
    return `<tr>
      <td class="user-name">${escHtml(o.name)}</td>
      <td>${escHtml(o.code || '—')}</td>
      <td>${estadoBadge}</td>
      <td style="font-size:12px;color:#666">${_sellerLabel(o.assigned_seller_id)}</td>
      <td>
        <div class="col-actions">
          ${canManage ? `<button class="btn btn-secondary btn-sm" onclick="adminOpenEditOrg('${o.id}')">Editar</button>` : ''}
          ${canManage ? `<button class="btn btn-secondary btn-sm" onclick="adminOpenAssignSeller('${o.id}')">Vendedor</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Render: opciones de selects (invitar / asignar vendedor) ───────────────

function _renderAdminInviteOptions() {
  const orgSel = document.getElementById('inv-organization');
  const scopeOrgs = _adminScope === 'vendedor'
    ? _adminOrgs.filter(o => o.status === 'activo' && o.assigned_seller_id === currentUser.id)
    : _adminOrgs.filter(o => o.status === 'activo');
  orgSel.innerHTML = '<option value="">— elegir organización —</option>' +
    scopeOrgs.map(o => `<option value="${o.id}">${escHtml(o.name)}</option>`).join('');

  const sellerSel = document.getElementById('as-seller-id');
  if (sellerSel) {
    const sellers = _adminProfiles.filter(p => p.role === 'vendedor' && p.status === 'activo');
    sellerSel.innerHTML = '<option value="">— Sin asignar —</option>' +
      sellers.map(p => `<option value="${p.id}">${escHtml(p.display_name || p.email)}</option>`).join('');
  }
}

function adminUpdateInviteOrgVisibility() {
  const rol     = document.getElementById('inv-rol').value;
  const orgWrap = document.getElementById('inv-org-wrap');
  const orgSel  = document.getElementById('inv-organization');
  const needsOrg = rol !== 'vendedor';
  orgWrap.style.display = needsOrg ? '' : 'none';
  orgSel.required = needsOrg;
  document.getElementById('inv-hint').textContent = rol === 'vendedor'
    ? 'Los vendedores no pertenecen a ninguna organización — se asignan después desde la tabla de organizaciones.'
    : '';
}

// ── Render: cuentas ──────────────────────────────────────────────────────

function _orgLabel(orgId) {
  if (!orgId) return '—';
  const o = _adminOrgs.find(o => o.id === orgId);
  return o ? escHtml(o.name) : '—';
}

function _vendorOwnsOrgLocally(organizationId) {
  return _adminOrgs.some(o => o.id === organizationId && o.assigned_seller_id === currentUser.id);
}

function _renderAdminAccounts() {
  const tbody = document.getElementById('admin-accounts-body');
  if (!_adminProfiles.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="admin-empty">No hay cuentas para mostrar.</div></td></tr>';
    return;
  }
  const roleLabels = { owner: 'Owner', vendedor: 'Vendedor', usuario: 'Usuario' };

  tbody.innerHTML = _adminProfiles.map(p => {
    const isSelf = p.id === currentUser.id;
    const canManage = _adminScope === 'owner' ||
      (_adminScope === 'vendedor' && p.role === 'usuario' && p.organization_id && _vendorOwnsOrgLocally(p.organization_id));
    const canToggle = canManage && !isSelf;

    const roleBadge   = `<span class="badge badge-${p.role}">${roleLabels[p.role] || p.role}</span>`;
    const estadoBadge = `<span class="badge badge-${p.status}">${p.status === 'activo' ? 'Activo' : 'Inactivo'}</span>`;
    const toggleLabel = p.status === 'activo' ? 'Desactivar' : 'Activar';
    const toggleClass = p.status === 'activo' ? 'btn-warning' : 'btn-success';

    return `<tr>
      <td>
        <div class="user-name">${escHtml(p.display_name || p.email)}</div>
        <div class="user-email">${escHtml(p.email)}</div>
      </td>
      <td>${roleBadge}</td>
      <td>${estadoBadge}</td>
      <td style="font-size:12px;color:#666">${_orgLabel(p.organization_id)}</td>
      <td>
        <div class="col-actions">
          ${canManage ? `<button class="btn btn-secondary btn-sm" onclick="adminOpenEditName('${p.id}')">Editar</button>` : ''}
          ${canToggle ? `<button class="btn ${toggleClass} btn-sm" onclick="adminToggleAccountStatus('${p.id}','${p.status}')">${toggleLabel}</button>` : ''}
          ${canManage ? `<button class="btn btn-secondary btn-sm" onclick="adminSendPasswordReset('${p.id}')">Recuperación</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Render: auditoría (solo owner) ──────────────────────────────────────

const _AUDIT_ACTION_LABELS = {
  'organization.created':          'Organización creada',
  'organization.updated':          'Organización editada',
  'organization.seller_assigned':  'Vendedor asignado',
  'user.invited':                  'Cuenta invitada',
  'user.profile_updated':          'Cuenta editada',
  'user.activated':                'Cuenta activada',
  'user.deactivated':              'Cuenta desactivada',
  'user.password_reset_requested': 'Recuperación enviada',
  'admin.operation_rejected':      'Operación rechazada',
};

function _renderAdminAudit() {
  if (_adminScope !== 'owner') return;
  const tbody = document.getElementById('admin-audit-body');
  if (!_adminAuditLogs.length) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="admin-empty">Sin eventos registrados.</div></td></tr>';
    return;
  }
  const actorLabel = (id) => {
    if (!id) return 'Sistema';
    const p = _adminProfiles.find(p => p.id === id);
    return p ? escHtml(p.display_name || p.email) : id;
  };
  tbody.innerHTML = _adminAuditLogs.map(a => {
    const fecha = a.created_at ? new Date(a.created_at).toLocaleString('es-AR') : '—';
    return `<tr>
      <td style="font-size:12px;color:#888;white-space:nowrap">${fecha}</td>
      <td>${escHtml(_AUDIT_ACTION_LABELS[a.action] || a.action)}</td>
      <td style="font-size:12px">${actorLabel(a.actor_user_id)}</td>
      <td style="font-size:12px;color:#888">${escHtml(a.target_type || '—')}</td>
    </tr>`;
  }).join('');
}

// ── Edge Function — única puerta de escritura privilegiada ─────────────────

async function _callAdminFunction(action, payload) {
  if (!supabaseClient) {
    return { ok: false, message: 'El servicio no está disponible en este momento.' };
  }
  try {
    const { data, error } = await supabaseClient.functions.invoke('admin-portal', {
      body: { action, payload },
    });
    if (error) {
      let message = 'No pudimos completar la operación. Intentá nuevamente.';
      if (error.context && typeof error.context.json === 'function') {
        try {
          const body = await error.context.json();
          if (body && body.error && body.error.message) message = body.error.message;
        } catch (parseError) {
          // Respuesta sin JSON válido — se usa el mensaje genérico.
        }
      }
      return { ok: false, message };
    }
    return { ok: true, data };
  } catch (unexpectedError) {
    console.error('[Admin] Error inesperado llamando admin-portal:', unexpectedError.message);
    return { ok: false, message: 'Ocurrió un error inesperado. Intentá nuevamente.' };
  }
}

// ── Alertas / helpers compartidos ───────────────────────────────────────

function adminShowAlert(elId, msg, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className   = `admin-alert admin-alert-${type} visible`;
  setTimeout(() => el.classList.remove('visible'), 4000);
}

function adminCloseModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Organizaciones — crear / editar / asignar vendedor ──────────────────

function adminToggleOrgForm() {
  const wrap = document.getElementById('admin-org-form-wrap');
  const btn  = document.getElementById('btn-toggle-org-form');
  const open = wrap.style.display === 'none' || !wrap.style.display;
  wrap.style.display = open ? 'block' : 'none';
  btn.textContent    = open ? 'Cancelar' : 'Nueva organización';
  if (!open) {
    document.getElementById('form-create-org').reset();
    document.getElementById('alert-org-create').classList.remove('visible');
  }
}

async function adminCreateOrganization(e) {
  e.preventDefault();
  const nombre = document.getElementById('org-nombre').value.trim();
  const codigo = document.getElementById('org-codigo').value.trim();
  const btn    = document.getElementById('btn-submit-org-create');

  if (!nombre) {
    adminShowAlert('alert-org-create', 'El nombre es obligatorio.', 'error');
    return;
  }

  if (btn) btn.disabled = true;
  const result = await _callAdminFunction('create_organization', { name: nombre, code: codigo || null });
  if (btn) btn.disabled = false;

  if (!result.ok) {
    adminShowAlert('alert-org-create', result.message, 'error');
    return;
  }

  document.getElementById('form-create-org').reset();
  adminToggleOrgForm();
  adminShowAlert('alert-orgs-table', `Organización "${nombre}" creada correctamente.`, 'success');
  _loadAdminData();
}

function adminOpenEditOrg(orgId) {
  const org = _adminOrgs.find(o => o.id === orgId);
  if (!org) return;
  document.getElementById('eo-org-id').value  = org.id;
  document.getElementById('eo-nombre').value  = org.name;
  document.getElementById('eo-codigo').value  = org.code || '';
  document.getElementById('eo-estado').value  = org.status;
  document.getElementById('alert-edit-org').classList.remove('visible');
  document.getElementById('modal-edit-org').classList.add('open');
}

async function adminSaveOrgEdit(e) {
  if (e) e.preventDefault();
  const id     = document.getElementById('eo-org-id').value;
  const nombre = document.getElementById('eo-nombre').value.trim();
  const codigo = document.getElementById('eo-codigo').value.trim();
  const estado = document.getElementById('eo-estado').value;

  if (!nombre) {
    adminShowAlert('alert-edit-org', 'El nombre es obligatorio.', 'error');
    return;
  }

  const result = await _callAdminFunction('update_organization', {
    organization_id: id, name: nombre, code: codigo || null, status: estado,
  });
  if (!result.ok) {
    adminShowAlert('alert-edit-org', result.message, 'error');
    return;
  }
  adminCloseModal('modal-edit-org');
  adminShowAlert('alert-orgs-table', 'Organización actualizada correctamente.', 'success');
  _loadAdminData();
}

function adminOpenAssignSeller(orgId) {
  const org = _adminOrgs.find(o => o.id === orgId);
  if (!org) return;
  document.getElementById('as-org-id').value      = org.id;
  document.getElementById('as-org-nombre').value  = org.name;
  document.getElementById('as-seller-id').value   = org.assigned_seller_id || '';
  document.getElementById('alert-assign-seller').classList.remove('visible');
  document.getElementById('modal-assign-seller').classList.add('open');
}

async function adminSaveAssignSeller(e) {
  if (e) e.preventDefault();
  const orgId    = document.getElementById('as-org-id').value;
  const sellerId = document.getElementById('as-seller-id').value || null;

  const result = await _callAdminFunction('assign_seller', { organization_id: orgId, seller_id: sellerId });
  if (!result.ok) {
    adminShowAlert('alert-assign-seller', result.message, 'error');
    return;
  }
  adminCloseModal('modal-assign-seller');
  adminShowAlert('alert-orgs-table', 'Vendedor asignado correctamente.', 'success');
  _loadAdminData();
}

// ── Invitar cuenta ───────────────────────────────────────────────────────

async function adminInviteUser(e) {
  e.preventDefault();
  const nombre = document.getElementById('inv-nombre').value.trim();
  const email  = document.getElementById('inv-email').value.trim();
  const rol    = _adminScope === 'vendedor' ? 'usuario' : document.getElementById('inv-rol').value;
  const organizationId = rol === 'usuario' ? (document.getElementById('inv-organization').value || null) : null;
  const btn    = document.getElementById('btn-submit-invite');

  if (!nombre || !email) {
    adminShowAlert('alert-invite', 'Completá nombre y email.', 'error');
    return;
  }
  if (rol === 'usuario' && !organizationId) {
    adminShowAlert('alert-invite', 'Elegí una organización para la credencial.', 'error');
    return;
  }

  if (btn) btn.disabled = true;
  const result = await _callAdminFunction('invite_user', {
    email, display_name: nombre, role: rol, organization_id: organizationId,
  });
  if (btn) btn.disabled = false;

  if (!result.ok) {
    adminShowAlert('alert-invite', result.message, 'error');
    return;
  }

  document.getElementById('form-invite').reset();
  if (_adminScope === 'vendedor') document.getElementById('inv-rol').value = 'usuario';
  adminUpdateInviteOrgVisibility();
  adminShowAlert('alert-invite', `Invitación enviada a ${email}.`, 'success');
  _loadAdminData();
}

// ── Cuentas — editar nombre / activar-desactivar / recuperación ─────────

function adminOpenEditName(profileId) {
  const p = _adminProfiles.find(p => p.id === profileId);
  if (!p) return;
  document.getElementById('en-profile-id').value = p.id;
  document.getElementById('en-nombre').value     = p.display_name || '';
  document.getElementById('alert-edit-name').classList.remove('visible');
  document.getElementById('modal-edit-name').classList.add('open');
}

async function adminSaveProfileName(e) {
  if (e) e.preventDefault();
  const id     = document.getElementById('en-profile-id').value;
  const nombre = document.getElementById('en-nombre').value.trim();

  if (!nombre) {
    adminShowAlert('alert-edit-name', 'El nombre es obligatorio.', 'error');
    return;
  }

  const result = await _callAdminFunction('update_profile', { profile_id: id, display_name: nombre });
  if (!result.ok) {
    adminShowAlert('alert-edit-name', result.message, 'error');
    return;
  }
  adminCloseModal('modal-edit-name');
  adminShowAlert('alert-accounts-table', 'Cuenta actualizada correctamente.', 'success');
  _loadAdminData();
}

async function adminToggleAccountStatus(profileId, currentStatus) {
  const nextStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
  const label = nextStatus === 'activo' ? 'activar' : 'desactivar';
  if (!confirm(`¿Seguro que querés ${label} esta cuenta?`)) return;

  const result = await _callAdminFunction('set_account_status', { profile_id: profileId, status: nextStatus });
  if (!result.ok) {
    adminShowAlert('alert-accounts-table', result.message, 'error');
    return;
  }
  adminShowAlert('alert-accounts-table', `Cuenta ${nextStatus === 'activo' ? 'activada' : 'desactivada'} correctamente.`, 'success');
  _loadAdminData();
}

async function adminSendPasswordReset(profileId) {
  if (!confirm('¿Enviar un correo de recuperación de contraseña a esta cuenta?')) return;
  const result = await _callAdminFunction('send_password_reset', { profile_id: profileId });
  if (!result.ok) {
    adminShowAlert('alert-accounts-table', result.message, 'error');
    return;
  }
  adminShowAlert('alert-accounts-table', 'Correo de recuperación enviado.', 'success');
}

// ── Limpieza de estado entre sesiones (ver clearPreviousSessionState en
//    js/estado.js) ──────────────────────────────────────────────────────

function _resetAdminState() {
  _adminOrgs = [];
  _adminProfiles = [];
  _adminAuditLogs = [];
  _adminScope = null;
  document.querySelectorAll('.admin-modal-bg.open').forEach(m => m.classList.remove('open'));
  const content    = document.getElementById('admin-content');
  const restricted = document.getElementById('admin-restricted');
  if (content)    content.style.display    = 'none';
  if (restricted) restricted.style.display = 'none';
  const errorEl = document.getElementById('admin-error');
  if (errorEl) errorEl.classList.remove('visible');
  const loadingEl = document.getElementById('admin-loading');
  if (loadingEl) loadingEl.style.display = 'none';
}

/* ── Password visibility toggle — lo sigue usando login / pwdsetup ── */

function togglePwdVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Ocultar' : 'Ver';
}
