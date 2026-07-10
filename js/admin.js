// -- ADMIN . gestion de usuarios -------------------------------------------
// NOTA (hallazgo de migracion): adminDelete/togglePwdVisibility estaban
// duplicadas palabra por palabra en el archivo original. Se preservan ambas
// copias tal cual (dead code inofensivo, la ultima declaracion gana) --
// reportado para decidir en una run aparte si se elimina.

function createUser(data) {
  const users = getUsers();
  // Validate unique email
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { ok: false, msg: 'Ya existe un usuario con ese email.' };
  }
  const newUser = {
    id:               'usr-' + Date.now(),
    nombre:           data.nombre.trim(),
    email:            data.email.trim().toLowerCase(),
    password:         data.password,
    clienteMayorista: data.clienteMayorista || null,
    rol:              data.rol,
    estado:           data.estado || 'activo',
    fechaAlta:        new Date().toISOString().slice(0,10),
    creadoPor:        currentUser ? currentUser.id : 'sistema'
  };
  users.push(newUser);
  saveUsers(users);
  return { ok: true, user: newUser };
}


function updateUser(id, data) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === id);
  if (idx === -1) return { ok: false, msg: 'Usuario no encontrado.' };
  // Validate unique email (excluding self)
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase()
                    && u.id !== id)) {
    return { ok: false, msg: 'Ya existe un usuario con ese email.' };
  }
  users[idx] = { ...users[idx], ...data };
  saveUsers(users);
  return { ok: true };
}


function changeUserPassword(id, newPassword) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === id);
  if (idx === -1) return { ok: false, msg: 'Usuario no encontrado.' };
  users[idx].password = newPassword;
  saveUsers(users);
  return { ok: true };
}


function toggleUserStatus(id) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === id);
  if (idx === -1) return { ok: false, msg: 'Usuario no encontrado.' };
  users[idx].estado = users[idx].estado === 'activo' ? 'inactivo' : 'activo';
  saveUsers(users);
  return { ok: true, estado: users[idx].estado };
}


function deleteUser(id) {
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === id);
  if (idx === -1) return { ok: false, msg: 'Usuario no encontrado.' };
  users.splice(idx, 1);
  saveUsers(users);
  return { ok: true };
}

// ── Render del panel ────────────────────────────────────────────────────────


function renderAdmin() {
  const restricted = document.getElementById('admin-restricted');
  const content    = document.getElementById('admin-content');

  // Guard: not logged in
  if (!currentUser) {
    if (restricted) restricted.style.display = 'block';
    if (content)    content.style.display    = 'none';
    return;
  }

  const perms = ROLES[currentUser.rol]?.permisos || {};

  // Access check
  if (!perms.verAdminPanel) {
    restricted.style.display = 'block';
    content.style.display    = 'none';
    return;
  }
  restricted.style.display = 'none';
  content.style.display    = 'block';

  const users    = getUsers() || [];
  const isOwner  = currentUser.rol === 'owner';
  const myId     = currentUser.id;

  // Filter by role
  const visible = isOwner
    ? users
    : users.filter(u => u.creadoPor === myId);

  // ── Stats ──────────────────────────────────────────────────────────────
  const statsEl = document.getElementById('admin-stats');
  const total   = visible.length;
  const activos = visible.filter(u => u.estado === 'activo').length;
  const owners  = visible.filter(u => u.rol === 'owner').length;
  const vends   = visible.filter(u => u.rol === 'vendedor').length;
  const usrs    = visible.filter(u => u.rol === 'usuario').length;
  statsEl.innerHTML = [
    { num: total,   label: 'Total'       },
    { num: activos, label: 'Activos'     },
    { num: owners,  label: 'Owners'      },
    { num: vends,   label: 'Vendedores'  },
    { num: usrs,    label: 'Usuarios'    },
  ].map(s => `
    <div class="admin-stat">
      <div class="admin-stat-num">${s.num}</div>
      <div class="admin-stat-label">${s.label}</div>
    </div>`).join('');

  // ── Create form: restrict rol options for vendedor ─────────────────────
  const rolSelect = document.getElementById('cu-rol');
  if (!isOwner) {
    // Vendedor can only create "usuario"
    rolSelect.innerHTML = '<option value="usuario">Usuario / Distribuidor</option>';
  } else {
    rolSelect.innerHTML = `
      <option value="">— Seleccionar —</option>
      <option value="owner">Owner</option>
      <option value="vendedor">Vendedor</option>
      <option value="usuario">Usuario / Distribuidor</option>`;
  }

  // ── Table ──────────────────────────────────────────────────────────────
  const tbody = document.getElementById('admin-table-body');
  if (!visible.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="admin-empty">
        
        No hay usuarios para mostrar.
      </div></td></tr>`;
    return;
  }

  tbody.innerHTML = visible.map(u => {
    const isSelf    = u.id === myId;
    const canEdit   = isOwner || u.creadoPor === myId;
    const canDelete = isOwner && !isSelf;
    const canToggle = isOwner || u.creadoPor === myId;
    const canPwd    = isOwner || u.creadoPor === myId;

    const roleBadge   = `<span class="badge badge-${u.rol}">${
      {owner:'Owner',vendedor:'Vendedor',usuario:'Usuario'}[u.rol] || u.rol}</span>`;
    const estadoBadge = `<span class="badge badge-${u.estado}">${
      u.estado === 'activo' ? 'Activo' : 'Inactivo'}</span>`;

    const toggleLabel = u.estado === 'activo' ? 'Desactivar' : 'Activar';
    const toggleClass = u.estado === 'activo' ? 'btn-warning' : 'btn-success';

    return `<tr>
      <td>
        <div class="user-name">${escHtml(u.nombre)}</div>
        <div class="user-email">${escHtml(u.email)}</div>
      </td>
      <td>${roleBadge}</td>
      <td>${estadoBadge}</td>
      <td style="font-size:12px;color:#666">${escHtml(u.clienteMayorista || '—')}</td>
      <td style="font-size:12px;color:#888;white-space:nowrap">${u.fechaAlta || '—'}</td>
      <td style="font-size:12px;color:#888">${escHtml(resolveCreator(u.creadoPor, users))}</td>
      <td>
        <div class="col-actions">
          ${canEdit   ? `<button class="btn btn-secondary btn-sm btn-icon" title="Editar"
                          onclick="adminOpenEdit('${u.id}')" style="min-width:52px">Editar</button>` : ''}
          ${canPwd    ? `<button class="btn btn-secondary btn-sm btn-icon" title="Contraseña"
                          onclick="adminOpenPwd('${u.id}')" style="min-width:52px">Clave</button>` : ''}
          ${canToggle ? `<button class="btn ${toggleClass} btn-sm"
                          onclick="adminToggleStatus('${u.id}')">${toggleLabel}</button>` : ''}
          ${canDelete ? `<button class="btn btn-danger btn-sm btn-icon" title="Eliminar"
                          onclick="adminDelete('${u.id}')" style="min-width:52px">Borrar</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Helpers ─────────────────────────────────────────────────────────────────


function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


function resolveCreator(creadoPor, users) {
  if (creadoPor === 'sistema') return 'Sistema';
  const u = users.find(u => u.id === creadoPor);
  return u ? u.nombre : creadoPor;
}


function adminShowAlert(elId, msg, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className   = `admin-alert admin-alert-${type} visible`;
  setTimeout(() => el.classList.remove('visible'), 4000);
}


function adminCloseModal(id) {
  document.getElementById(id).classList.remove('open');
}


function adminToggleForm() {
  const form = document.getElementById('admin-create-form');
  const btn  = document.getElementById('btn-toggle-form');
  const open = form.style.display === 'none';
  form.style.display = open ? 'block' : 'none';
  btn.textContent    = open ? 'Ocultar formulario' : 'Mostrar formulario';
  if (!open) {
    document.getElementById('form-create-user').reset();
    document.getElementById('alert-create').classList.remove('visible');
  }
}

// Mayorista field: required when rol=usuario

function adminUpdateMayoristaHint() {
  const rol   = document.getElementById('cu-rol').value;
  const req   = document.getElementById('cu-mayorista-req');
  const hint  = document.getElementById('cu-mayorista-hint');
  const input = document.getElementById('cu-mayorista');
  if (rol === 'usuario') {
    req.innerHTML         = '<span class="form-required">*</span>';
    hint.textContent      = 'Obligatorio para distribuidores';
    input.required        = true;
  } else {
    req.innerHTML         = '';
    hint.textContent      = '';
    input.required        = false;
  }
}

// ── Create user ──────────────────────────────────────────────────────────────


function adminCreateUser(e) {
  e.preventDefault();
  // Guard: must be logged in and have createUsers permission
  if (!currentUser) return;
  const perms   = ROLES[currentUser.rol]?.permisos || {};
  const isOwner = currentUser.rol === 'owner';
  if (!perms.crearUsuarios) {
    adminShowAlert('alert-create', 'No tenés permisos para crear usuarios.', 'error');
    return;
  }

  const nombre      = document.getElementById('cu-nombre').value.trim();
  const email       = document.getElementById('cu-email').value.trim();
  const password    = document.getElementById('cu-password').value;
  const rol         = document.getElementById('cu-rol').value;
  const mayorista   = document.getElementById('cu-mayorista').value.trim();
  const estado      = document.getElementById('cu-estado').value;

  // Validations
  if (!nombre || !email || !password || !rol) {
    adminShowAlert('alert-create', 'Completá todos los campos obligatorios.', 'error');
    return;
  }
  if (password.length < 6) {
    adminShowAlert('alert-create', 'La contraseña debe tener al menos 6 caracteres.', 'error');
    return;
  }
  if (!isOwner && (rol === 'owner' || rol === 'vendedor')) {
    adminShowAlert('alert-create', 'No tenés permisos para crear usuarios con ese rol.', 'error');
    return;
  }
  if (rol === 'usuario' && !mayorista) {
    adminShowAlert('alert-create', 'El cliente mayorista es obligatorio para usuarios distribuidores.', 'error');
    return;
  }

  const result = createUser({ nombre, email, password, rol, clienteMayorista: mayorista, estado });
  if (!result.ok) {
    adminShowAlert('alert-create', result.msg, 'error');
    return;
  }
  adminShowAlert('alert-create', `Usuario "${nombre}" creado correctamente.`, 'success');
  document.getElementById('form-create-user').reset();
  renderAdmin();
}

// ── Edit user ────────────────────────────────────────────────────────────────


function adminOpenEdit(id) {
  const users = getUsers();
  const u     = users.find(u => u.id === id);
  if (!u) return;

  const isOwner  = currentUser.rol === 'owner';
  const isSelf   = u.id === currentUser.id;

  document.getElementById('eu-id').value        = u.id;
  document.getElementById('eu-nombre').value    = u.nombre;
  document.getElementById('eu-email').value     = u.email;
  document.getElementById('eu-mayorista').value = u.clienteMayorista || '';
  document.getElementById('eu-estado').value    = u.estado;

  // Role: owner can change roles (except own), vendedor cannot
  const rolWrap = document.getElementById('eu-rol-wrap');
  const rolSel  = document.getElementById('eu-rol');
  if (isOwner && !isSelf) {
    rolWrap.style.display = '';
    rolSel.value = u.rol;
  } else {
    rolWrap.style.display = 'none';
  }

  document.getElementById('alert-edit').classList.remove('visible');
  document.getElementById('modal-edit').classList.add('open');
}


function adminSaveEdit(e) {
  if (e) e.preventDefault();
  if (!currentUser) return;
  const id       = document.getElementById('eu-id').value;
  const nombre   = document.getElementById('eu-nombre').value.trim();
  const email    = document.getElementById('eu-email').value.trim();
  const mayorista= document.getElementById('eu-mayorista').value.trim();
  const estado   = document.getElementById('eu-estado').value;
  const isOwner  = currentUser.rol === 'owner';

  const users    = getUsers();
  const u        = users.find(u => u.id === id);
  if (!u) { adminShowAlert('alert-edit', 'Usuario no encontrado.', 'error'); return; }
  const isSelf   = u.id === currentUser.id;

  // Vendedor can only edit users they created
  if (!isOwner && u.creadoPor !== currentUser.id) {
    adminShowAlert('alert-edit', 'No tenés permisos para editar este usuario.', 'error');
    return;
  }

  const data = { nombre, email, clienteMayorista: mayorista || null, estado };

  // Role change only for owner editing others
  if (isOwner && !isSelf) {
    data.rol = document.getElementById('eu-rol').value;
  }

  if (!nombre || !email) {
    adminShowAlert('alert-edit', 'Nombre y email son obligatorios.', 'error');
    return;
  }

  const result = updateUser(id, data);
  if (!result.ok) {
    adminShowAlert('alert-edit', result.msg, 'error');
    return;
  }
  adminCloseModal('modal-edit');
  adminShowAlert('alert-table', 'Usuario actualizado correctamente.', 'success');
  renderAdmin();
}

// ── Change password ──────────────────────────────────────────────────────────


function adminOpenPwd(id) {
  document.getElementById('pwd-id').value = id;
  document.getElementById('pwd-new').value     = '';
  document.getElementById('pwd-confirm').value = '';
  document.getElementById('alert-pwd').classList.remove('visible');
  document.getElementById('modal-pwd').classList.add('open');
}


function adminSavePwd(e) {
  if (e) e.preventDefault();
  if (!currentUser) return;
  const id      = document.getElementById('pwd-id').value;
  const newPwd  = document.getElementById('pwd-new').value;
  const confirm = document.getElementById('pwd-confirm').value;

  // Ownership guard
  const users = getUsers();
  const u     = users.find(u => u.id === id);
  if (u && currentUser.rol !== 'owner' && u.creadoPor !== currentUser.id) {
    adminShowAlert('alert-pwd', 'No tenés permisos para cambiar la contraseña de este usuario.', 'error');
    return;
  }

  if (newPwd.length < 6) {
    adminShowAlert('alert-pwd', 'La contraseña debe tener al menos 6 caracteres.', 'error');
    return;
  }
  if (newPwd !== confirm) {
    adminShowAlert('alert-pwd', 'Las contraseñas no coinciden.', 'error');
    return;
  }

  const result = changeUserPassword(id, newPwd);
  if (!result.ok) {
    adminShowAlert('alert-pwd', result.msg, 'error');
    return;
  }
  adminCloseModal('modal-pwd');
  adminShowAlert('alert-table', 'Contraseña actualizada correctamente.', 'success');
}

// ── Toggle status ────────────────────────────────────────────────────────────


function adminToggleStatus(id) {
  if (!currentUser) return;
  const users  = getUsers();
  const u      = users.find(u => u.id === id);
  if (!u) return;

  // Can't toggle self
  if (u.id === currentUser.id) {
    adminShowAlert('alert-table', 'No podés desactivar tu propio usuario.', 'error');
    return;
  }

  // Vendedor can only toggle users they created
  if (currentUser.rol !== 'owner' && u.creadoPor !== currentUser.id) {
    adminShowAlert('alert-table', 'No tenés permisos para modificar este usuario.', 'error');
    return;
  }

  const result = toggleUserStatus(id);
  if (!result.ok) {
    adminShowAlert('alert-table', result.msg, 'error');
    return;
  }
  const label = result.estado === 'activo' ? 'activado' : 'desactivado';
  adminShowAlert('alert-table', `Usuario ${label} correctamente.`, 'success');
  renderAdmin();
}

// ── Delete user ──────────────────────────────────────────────────────────────


function adminDelete(id) {
  const users = getUsers();
  const u     = users.find(u => u.id === id);
  if (!u) return;

  // Can't delete self
  if (u.id === currentUser.id) {
    adminShowAlert('alert-table', 'No podés eliminar tu propio usuario.', 'error');
    return;
  }
  // Vendedor can't delete anyone
  if (currentUser.rol !== 'owner') {
    adminShowAlert('alert-table', 'No tenés permisos para eliminar usuarios.', 'error');
    return;
  }

  if (!confirm(`¿Eliminár al usuario "${u.nombre}"? Esta acción no se puede deshacer.`)) return;

  const result = deleteUser(id);
  if (!result.ok) {
    adminShowAlert('alert-table', result.msg, 'error');
    return;
  }
  adminShowAlert('alert-table', `Usuario "${u.nombre}" eliminado.`, 'success');
  renderAdmin();
}


/* ── Password visibility toggle ── */

function togglePwdVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Ocultar' : 'Ver';
}

/* ── Delete user ──────────────────────────────────────────────────────────────── */


function adminDelete(id) {
  const users = getUsers();
  const u     = users.find(u => u.id === id);
  if (!u) return;

  if (u.id === currentUser.id) {
    adminShowAlert('alert-table', 'No podés eliminar tu propio usuario.', 'error');
    return;
  }
  if (currentUser.rol !== 'owner') {
    adminShowAlert('alert-table', 'No tenés permisos para eliminar usuarios.', 'error');
    return;
  }

  if (!confirm(`¿Eliminár al usuario "${u.nombre}"? Esta acción no se puede deshacer.`)) return;

  const result = deleteUser(id);
  if (!result.ok) {
    adminShowAlert('alert-table', result.msg, 'error');
    return;
  }
  adminShowAlert('alert-table', `Usuario "${u.nombre}" eliminado.`, 'success');
  renderAdmin();
}


/* ── Password visibility toggle ── */

function togglePwdVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.textContent = show ? 'Ocultar' : 'Ver';
}


