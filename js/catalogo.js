function renderPalas(){
  const fl = document.getElementById('f-linea').value;
  const fn = document.getElementById('f-nivel').value;
  const fe = document.getElementById('f-estilo').value;
  const ff = document.getElementById('f-forma').value;
  const sq = normalizeStr(document.getElementById('search-palas').value || '');

  const total    = PALAS.length;
  const filtered = PALAS.filter(p => {
    if (fl && p.linea !== fl)                                          return false;
    if (fn && !p.nivel.includes(fn))                                   return false;
    if (fe && !p.estilo.toLowerCase().includes(fe.toLowerCase()))      return false;
    if (ff && !normalizeStr(p.forma).includes(normalizeStr(ff)))       return false;
    if (sq && !palHaystack(p).includes(sq))                            return false;
    return true;
  });

  // ── Counter ────────────────────────────────────────────────────────────
  const mainEl = document.getElementById('count-main');
  const subEl  = document.getElementById('count-sub');
  if (mainEl) mainEl.textContent = filtered.length + ' pala' + (filtered.length !== 1 ? 's' : '');
  if (subEl)  subEl.textContent  = filtered.length < total
    ? ' de ' + total + ' en el catálogo'
    : ' en el catálogo';

  // ── Active filter tags ─────────────────────────────────────────────────
  const tagsEl = document.getElementById('filter-tags');
  const clearBtn = document.getElementById('btn-clear');
  const activeTags = [];
  if (fl) activeTags.push({ label: fl,  clear: () => { document.getElementById('f-linea').value=''; renderPalas(); } });
  if (fn) activeTags.push({ label: fn,  clear: () => { document.getElementById('f-nivel').value=''; renderPalas(); } });
  if (fe) activeTags.push({ label: fe,  clear: () => { document.getElementById('f-estilo').value=''; renderPalas(); } });
  if (ff) activeTags.push({ label: ff,  clear: () => { document.getElementById('f-forma').value=''; renderPalas(); } });
  if (sq) activeTags.push({ label: '"' + document.getElementById('search-palas').value.trim() + '"',
                             clear: () => { document.getElementById('search-palas').value=''; renderPalas(); } });

  if (tagsEl) {
    tagsEl.innerHTML = activeTags.map((t, i) =>
      `<span class="filter-tag">${t.label}
         <button class="filter-tag-remove" onclick="window._filterClear[${i}]()" title="Quitar filtro">×</button>
       </span>`
    ).join('');
    window._filterClear = activeTags.map(t => t.clear);
  }

  // Highlight clear button when filters active
  if (clearBtn) clearBtn.classList.toggle('has-filters', activeTags.length > 0);

  // Highlight active selects
  ['f-linea','f-nivel','f-estilo','f-forma'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', !!el.value);
  });

  // ── Grid ─────────────────────────────────────────────────────────────
  const grid = document.getElementById('palas-grid');
  if (!filtered.length) {
    const activeLabels = activeTags.map(t => t.label).join(', ');
    grid.innerHTML = `
      <div class="no-results-block" style="grid-column:1/-1">
        <div class="no-results-icon" style="font-size:28px;font-weight:900;color:#ddd;letter-spacing:-.02em">—</div>
        <div class="no-results-title">Sin resultados</div>
        <div class="no-results-sub">
          No encontramos palas para los filtros aplicados:<br>
          <strong>${activeLabels || 'búsqueda actual'}</strong>
        </div>
        <button class="no-results-clear" onclick="clearFilters()">Limpiar filtros</button>
      </div>`;
    return;
  }
  grid.innerHTML=filtered.map(p=>`
    <article class="pala-card" onclick="openPalaModal('${p.id}')" style="cursor:pointer" title="Ver ficha de ${p.nombre}">
      <img class="pala-img" src="${palaImgSrc(p.id)}" alt="${p.nombre}" loading="lazy" onclick="event.stopPropagation();openLightbox(this.src,this.alt)" style="cursor:zoom-in">
      <div class="pala-body">
        <span class="linea-tag tag-${p.linea}">${p.linea}</span>
        <div class="pala-name">${p.nombre}</div>
        <div class="estilo-row">
          <span class="estilo-pill ${estiloClass(p.estilo)}">${p.estilo}</span>
          <span class="jugador-badge ${nivelClass(p.nivel)}">${p.nivel}</span>
        </div>
        <div class="pala-card-extra">
          ${p.descTecnica?`<div class="pala-desc">${p.descTecnica}</div>`:''}
          ${p.sensacionJuego?`<details class="pala-sensacion-wrap"><summary>Descripción para el jugador</summary><div class="pala-sensacion">${p.sensacionJuego}</div></details>`:''}
          <div class="specs-grid">
            <div class="spec-item"><div class="label">Peso</div><div class="val">${p.peso}</div></div>
            <div class="spec-item"><div class="label">Perfil</div><div class="val">${p.perfil}</div></div>
            <div class="spec-item"><div class="label">Forma</div><div class="val">${p.forma}</div></div>
            <div class="spec-item"><div class="label">Balance</div><div class="val">${p.balance}</div></div>
            <div class="spec-item"><div class="label">Comp. exterior</div><div class="val">${p.exterior}</div></div>
            <div class="spec-item"><div class="label">Núcleo</div><div class="val">${p.interior}</div></div>
            ${p.jugador?`<div class="spec-item" style="grid-column:span 2"><div class="label">Jugador</div><div class="val">${p.jugador}</div></div>`:''}
          </div>
          ${p.tecnologias&&p.tecnologias.length?`<div class="techs-row">${p.tecnologias.map(t=>`<span class="tech-chip">${t}</span>`).join('')}</div>`:''}
          ${p.nota?`<span class="nota-tag">⚠ ${p.nota}</span>`:''}
          <button class="pala-card-btn" onclick="event.stopPropagation();openPalaModal('${p.id}')">Ver ficha completa</button>
        </div>
      </div>
    </article>
  `).join('');
}


function toggleCatalogoFiltros() {
  const row = document.getElementById('filters-row');
  const btn = document.getElementById('btn-toggle-filtros');
  if (!row || !btn) return;
  const open = row.style.display !== 'none';
  row.style.display = open ? 'none' : 'flex';
  btn.classList.toggle('open', !open);
}

function clearFilters() {
  document.getElementById('search-palas').value = '';
  document.getElementById('f-linea').value  = '';
  document.getElementById('f-nivel').value  = '';
  document.getElementById('f-estilo').value = '';
  document.getElementById('f-forma').value  = '';
  renderPalas();
}


function renderItems(){
  const c=document.getElementById('glosario-container');
  const sq=(document.getElementById('search-items').value||'').toLowerCase().trim();
  const CATS=[
    {label:'Materiales',cats:['Fibras de carbono','Fibras híbridas','Fibras básicas','Núcleos EVA'],tipo:'mat'},
    {label:'Tecnologías propias',cats:['Superficie','Puño y grip','Estructura interna','Marco','Perforación','Aerodinámica'],tipo:'tech'},
  ];
  let html='';
  for(const grp of CATS){
    html+=`<div class="glos-section-head">${grp.label}</div>`;
    for(const cat of grp.cats){
      const items=ITEMS.filter(i=>i.cat===cat&&(!sq||[i.nom,i.desc,i.sensacion,i.pitch,i.vsOtros||''].join(' ').toLowerCase().includes(sq)));
      if(!items.length)continue;
      html+=`<div class="cat-label">${cat}</div><div class="items-grid">`;
      html+=items.map(i=>`
        <div class="item-card" onclick="openDetailModal('${i.cod}')" title="Ver detalle de ${i.nom}">
          <div class="item-hero">
            <div class="item-hero-left">
              <div class="item-icon-sym" style="color:${i.tc||'var(--rojo)'}">${i.cod}</div>
              <div class="item-icon-label" style="color:${i.tc||'var(--rojo)'}">${i.nom.split(' ')[0].toUpperCase()}</div>
              <div class="item-redbar"></div>
              <div class="item-fullname">${i.nom}</div>
              <span class="item-tipo-badge ${i.tipo==='mat'?'badge-mat':'badge-tech'}">${i.tipo==='mat'?'Material':'Tecnología'}</span>
            </div>
            ${itemImgSrc(i.cod)?`<div class="item-hero-img"><img src="${itemImgSrc(i.cod)}" alt="${i.nom}"></div>`:''}
          </div>
          <div class="item-blocks">
            <div class="item-block">
              <div class="block-label">Descripción técnica</div>
              <div class="block-text">${i.desc}</div>
            </div>
            <div class="item-block">
              <div class="block-label">Sensaciones de juego</div>
              <div class="block-text sensacion">${i.sensacion}</div>
            </div>
            <div class="item-block">
              <div class="block-label">Argumento de venta</div>
              <div class="block-text pitch">${i.pitch}</div>
            </div>
            <div class="item-block">
              <div class="block-label">¿En qué se diferencia?</div>
              <div class="block-text vs-text">${i.vsOtros}</div>
            </div>
          </div>
          <div class="item-card-hint">Ver detalle →</div>
        </div>
      `).join('');
      html+='</div>';
    }
  }
  c.innerHTML=html;
}


function renderTabla(){
  const tbody=document.getElementById('tabla-body');
  tbody.innerHTML=PALAS.map(p=>`<tr>
    <td><img class="tabla-pala-img" src="${palaImgSrc(p.id)}" alt="${p.nombre}" loading="lazy" onclick="openLightbox(this.src,this.alt)" style="cursor:zoom-in"></td>
    <td style="font-weight:600">${p.nombre}</td>
    <td><span class="linea-tag tag-${p.linea}">${p.linea}</span></td>
    <td>${p.forma}</td>
    <td>${p.peso}</td>
    <td>${p.perfil}</td>
    <td>${p.balance}</td>
    <td style="font-size:12px">${p.exterior}</td>
    <td style="font-size:12px">${p.interior}</td>
    <td><span class="jugador-badge ${nivelClass(p.nivel)}">${p.nivel}</span></td>
    <td><span class="estilo-pill ${estiloClass(p.estilo)}" style="font-size:11px;padding:3px 8px;border-radius:20px">${p.estilo}</span></td>
  </tr>`).join('');
}



/* ══════════════════════════════════════════════════════════════════════
   DESCARGA CATÁLOGO TÉCNICO — CSV
   Funciones: csvEscape · getMaterialNombre · formatArrayForCSV
              buildCatalogoTecnicoRows · downloadCatalogoTecnicoCSV
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Escapa un valor para CSV:
 * - Convierte null/undefined a cadena vacía.
 * - Si el valor contiene punto y coma, salto de línea o comilla,
 *   lo encierra en comillas dobles y duplica las comillas internas.
 */

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (str === '') return '';
  // Needs quoting?
  if (str.includes(';') || str.includes('"') ||
      str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Dado un código de material (ej: "X12"), devuelve el nombre completo
 * usando el array MATERIALES. Si no lo encuentra, devuelve el código.
 */

function getMaterialNombre(codigo) {
  if (!codigo) return '';
  const mat = MATERIALES.find(m => m.cod === codigo || m.id === codigo);
  return mat ? mat.nombre : codigo;
}

/**
 * Convierte un array JS (ej: ["Vertex Core","Hesacore"]) a string CSV-friendly:
 * los items separados por coma dentro de una celda.
 * Si el array está vacío o no existe, devuelve "-".
 */

function formatArrayForCSV(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return '-';
  return arr.join(', ');
}

/**
 * Construye las filas de datos del catálogo técnico.
 * Trabaja contra el array PALAS del modelo de datos.
 * Excluye SKU, imágenes base64, precios, stock y datos de ecommerce.
 * Traduce códigos de materiales a nombres completos via getMaterialNombre().
 */

function buildCatalogoTecnicoRows() {
  const palas = PALAS || [];
  return palas.map(p => {
    // Translate material codes to full names
    const materialesNombres = Array.isArray(p.materiales)
      ? p.materiales.map(getMaterialNombre).join(', ')
      : '-';

    // imagen_referencia: just the id, never base64
    const imgRef = p.id ? 'img-' + p.id : '-';

    return [
      csvEscape(p.nombre           || '-'),
      csvEscape(p.linea            || '-'),
      csvEscape(p.forma            || '-'),
      csvEscape(p.peso             || '-'),
      csvEscape(p.perfil           || '-'),
      csvEscape(p.balance          || '-'),
      csvEscape(p.exterior         || '-'),
      csvEscape(p.interior         || '-'),
      csvEscape(p.nivel            || '-'),
      csvEscape(p.estilo           || '-'),
      csvEscape(formatArrayForCSV(p.tecnologias)),
      csvEscape(materialesNombres  || '-'),
      csvEscape(p.perfilJugador    || '-'),
      csvEscape(p.sensacionJuego   || '-'),
      csvEscape(p.argumentoVenta   || '-'),
      csvEscape(p.descTecnica      || '-'),
      csvEscape(imgRef),
    ].join(';');
  });
}

/**
 * Genera y descarga el CSV del catálogo técnico.
 * - Requiere sesión activa.
 * - UTF-8 con BOM para compatibilidad con Excel Argentina (punto y coma).
 * - No incluye SKU, precios, stock, EAN ni imágenes base64.
 */

function downloadCatalogoTecnicoCSV() {
  // Auth guard
  if (!currentUser) {
    const msg = document.getElementById('download-msg');
    if (msg) {
      msg.textContent = 'Necesitás iniciar sesión para descargar el catálogo.';
      msg.classList.add('visible');
      setTimeout(() => msg.classList.remove('visible'), 4000);
    }
    return;
  }

  // Header row
  const headers = [
    'nombre',
    'linea',
    'forma',
    'peso',
    'perfil',
    'balance',
    'composicion_exterior',
    'nucleo',
    'nivel',
    'estilo',
    'tecnologias',
    'materiales',
    'perfil_jugador',
    'sensacion_juego',
    'argumento_venta',
    'descripcion_tecnica',
    'imagen_referencia',
  ].join(';');

  const rows   = buildCatalogoTecnicoRows();
  const BOM    = '\uFEFF'; // UTF-8 BOM — Excel Argentina reads tildes correctly
  const csv    = BOM + headers + '\n' + rows.join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'catalogo-tecnico-bullpadel-2026.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/* ═══════════════════════════════════════════════════
   JS · DETAIL MODAL — Materiales y Tecnologías
   ═══════════════════════════════════════════════════ */

/**
 * Find palas that use a given material/tech code or name.
 * Checks p.materiales (codes) and p.tecnologias (names).
 */

function getPalasForItem(item) {
  const cod  = item.cod  || '';
  const nom  = item.nom  || item.nombre || '';
  return PALAS.filter(p => {
    const inMat  = Array.isArray(p.materiales)  && p.materiales.includes(cod);
    const inTech = Array.isArray(p.tecnologias) && p.tecnologias.includes(nom);
    return inMat || inTech;
  });
}

function openDetailModal(cod) {
  const item = ITEMS.find(i => i.cod === cod);
  if (!item) return;

  // ── Hero ──────────────────────────────────────────────────────────────
  const heroLeft = document.getElementById('detail-hero-left');
  heroLeft.style.background = item.bg || '#f9f9f9';

  const symEl = document.getElementById('detail-icon-sym');
  symEl.textContent  = item.cod;
  symEl.style.color  = item.tc || '#C8102E';

  const labelEl = document.getElementById('detail-icon-label');
  labelEl.textContent = item.tipo === 'mat' ? 'Material' : 'Tecnología';
  labelEl.style.color = item.tc || '#C8102E';

  // Image
  const imgWrap = document.getElementById('detail-hero-img');
  const imgEl   = document.getElementById('detail-hero-img-el');
  if (itemImgSrc(item.cod)) {
    imgEl.src              = itemImgSrc(item.cod);
    imgEl.alt              = item.nom + ' — ' + (item.cat || '');
    imgWrap.style.display  = 'flex';
  } else {
    imgWrap.style.display  = 'none';
  }

  // Badge + nombre + categoría
  const badge = document.getElementById('detail-tipo-badge');
  badge.textContent = item.tipo === 'mat' ? 'Material' : 'Tecnología';
  badge.className   = 'detail-tipo-badge ' + (item.tipo === 'mat' ? 'badge-mat' : 'badge-tech');

  document.getElementById('detail-nombre').textContent    = item.nom || '';
  document.getElementById('detail-categoria').textContent = item.cat || '';

  // ── Body blocks ───────────────────────────────────────────────────────
  function setBlock(blockId, textId, value) {
    const block = document.getElementById(blockId);
    const text  = document.getElementById(textId);
    if (value && value !== '-') {
      text.textContent       = value;
      block.style.display    = '';
    } else {
      block.style.display    = 'none';
    }
  }

  setBlock('detail-block-desc',  'detail-desc',  item.desc);
  setBlock('detail-block-sens',  'detail-sens',  item.sensacion);
  setBlock('detail-block-pitch', 'detail-pitch', item.pitch);
  setBlock('detail-block-vs',    'detail-vs',    item.vsOtros);

  // ── Palas asociadas ───────────────────────────────────────────────────
  const palas   = getPalasForItem(item);
  const palasEl = document.getElementById('detail-palas');
  if (palas.length) {
    palasEl.innerHTML = '<div class="detail-palas-grid">' +
      palas.map(p => {
        const img = palaImgSrc(p.id)
          ? `<img src="${palaImgSrc(p.id)}" alt="${p.nombre}">`
          : '';
        const linea = p.linea
          ? `<span class="linea-tag tag-${p.linea}" style="font-size:9px">${p.linea}</span>`
          : '';
        return `<div class="detail-pala-chip">${img}<span>${p.nombre}</span>${linea}</div>`;
      }).join('') +
    '</div>';
  } else {
    palasEl.innerHTML = '<div class="detail-palas-empty">Sin palas asociadas en esta versión.</div>';
  }

  // ── Open modal ────────────────────────────────────────────────────────
  document.getElementById('modal-detail').classList.add('open');
  document.body.style.overflow = 'hidden';
}


function closeDetailModal() {
  document.getElementById('modal-detail').classList.remove('open');
  document.body.style.overflow = '';
}


function detailModalBgClick(e) {
  // Close only if clicking the overlay background (not the modal box)
  if (e.target === document.getElementById('modal-detail')) {
    closeDetailModal();
  }
}

// Escape key closes detail modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.getElementById('modal-detail').classList.contains('open')) {
      closeDetailModal();
    }
  }
});

function getMaterialesNombres(codesArr) {
  if (!Array.isArray(codesArr)) return [];
  return codesArr.map(cod => {
    const mat = MATERIALES.find(m => m.cod === cod || m.id === cod);
    return mat
      ? { nombre: mat.nombre, bg: mat.bg || '#f0f0f0', tc: mat.tc || '#444', tipo: mat.tipo || '' }
      : { nombre: cod, bg: '#f0f0f0', tc: '#444', tipo: '' };
  });
}

/** Conditionally show/hide a section block */

function pmSet(wrapId, contentId, value, fn) {
  const wrap    = document.getElementById(wrapId);
  const content = document.getElementById(contentId);
  if (!wrap || !content) return;
  const val = value && value !== '-' && value !== 'null' ? value : null;
  if (val) {
    wrap.style.display = '';
    if (fn) fn(content, val);
    else content.textContent = val;
  } else {
    wrap.style.display = 'none';
  }
}

/** Open the pala detail modal */

function openPalaModal(palaId) {
  const p = PALAS.find(p => p.id === palaId);
  if (!p) return;
  _currentPalaId = palaId;

  // ── Image ──────────────────────────────────────────────────────────────
  const imgEl = document.getElementById('pm-img');
  imgEl.src = palaImgSrc(p.id);
  imgEl.alt = p.nombre;

  // ── Header ─────────────────────────────────────────────────────────────
  const lineaTag = document.getElementById('pm-linea-tag');
  lineaTag.textContent = p.linea || '';
  lineaTag.className   = 'linea-tag tag-' + (p.linea || '');

  document.getElementById('pm-nombre').textContent = p.nombre || '';

  // Badges: estilo + nivel
  const badgesEl = document.getElementById('pm-badges');
  badgesEl.innerHTML = [
    p.estilo ? `<span class="estilo-pill ${estiloClass(p.estilo)}">${p.estilo}</span>` : '',
    p.nivel  ? `<span class="jugador-badge ${nivelClass(p.nivel)}">${p.nivel}</span>`  : '',
  ].join('');

  // Jugador
  const jugEl = document.getElementById('pm-jugador');
  if (p.jugador) {
    jugEl.textContent    = 'Pala de ' + p.jugador;
    jugEl.style.display  = '';
  } else {
    jugEl.style.display  = 'none';
  }

  // ── Specs ──────────────────────────────────────────────────────────────
  const specsData = [
    { label: 'Forma',          val: p.forma      },
    { label: 'Peso',           val: p.peso       },
    { label: 'Perfil',         val: p.perfil     },
    { label: 'Balance',        val: p.balance    },
    { label: 'Superficie',     val: p.superficie },
    { label: 'Comp. exterior', val: p.exterior   },
    { label: 'Núcleo',         val: p.interior   },
    { label: 'Rugoso',         val: p.rugoso     },
    { label: 'Tacto',          val: p.tacto      },
  ].filter(s => s.val && s.val !== 'null' && s.val !== '-');

  document.getElementById('pm-specs').innerHTML = specsData.map(s =>
    `<div class="pala-modal-spec-item">
       <div class="label">${s.label}</div>
       <div class="val">${s.val}</div>
     </div>`
  ).join('');

  // ── Tecnologías ────────────────────────────────────────────────────────
  const techsWrap = document.getElementById('pm-techs-wrap');
  const techsEl   = document.getElementById('pm-techs');
  if (p.tecnologias && p.tecnologias.length) {
    techsEl.innerHTML = p.tecnologias.map(t =>
      `<span class="pala-modal-tech-chip">${t}</span>`
    ).join('');
    techsWrap.style.display = '';
  } else {
    techsWrap.style.display = 'none';
  }

  // ── Materiales ────────────────────────────────────────────────────────
  const matsWrap = document.getElementById('pm-mats-wrap');
  const matsEl   = document.getElementById('pm-mats');
  if (p.materiales && p.materiales.length) {
    const mats = getMaterialesNombres(p.materiales);
    matsEl.innerHTML = mats.map(m =>
      `<span class="pala-modal-mat-chip"
             style="background:${m.bg};color:${m.tc}">
         ${m.nombre}
         ${m.tipo ? `<span style="font-size:9px;opacity:.7">(${m.tipo})</span>` : ''}
       </span>`
    ).join('');
    matsWrap.style.display = '';
  } else {
    matsWrap.style.display = 'none';
  }

  // ── Nota ──────────────────────────────────────────────────────────────
  const notaWrap = document.getElementById('pm-nota-wrap');
  const notaEl   = document.getElementById('pm-nota');
  if (p.nota) {
    notaEl.textContent     = '⚠ ' + p.nota;
    notaWrap.style.display = '';
  } else {
    notaWrap.style.display = 'none';
  }

  // ── Right column ───────────────────────────────────────────────────────
  pmSet('pm-perfil-wrap',    'pm-perfil',    p.perfilJugador);
  pmSet('pm-sensacion-wrap', 'pm-sensacion', p.sensacionJuego);
  pmSet('pm-argumento-wrap', 'pm-argumento', p.argumentoVenta);
  pmSet('pm-desc-wrap',      'pm-desc',      p.descTecnica);

  // ── Footer: comparar ─────────────────────────────────────────────────
  resetCompareFooter();

  // ── Open ─────────────────────────────────────────────────────────────
  document.getElementById('modal-pala').classList.add('open');
  document.body.style.overflow = 'hidden';
}


function closePalaModal() {
  document.getElementById('modal-pala').classList.remove('open');
  document.body.style.overflow = '';
  _currentPalaId = null;
}


function palaBgClick(e) {
  if (e.target === document.getElementById('modal-pala')) closePalaModal();
}

/** Reset the compare footer to default state */

function resetCompareFooter() {
  document.getElementById('pm-comp-msg').textContent    = '';
  document.getElementById('pm-btn-go-comp').style.display = 'none';
}

/** Add current pala to the first free comparador slot */

function addToComparador() {
  if (!_currentPalaId) return;
  const selIds = ['c1','c2','c3'];

  // Check if already added
  for (const id of selIds) {
    const sel = document.getElementById(id);
    if (sel && sel.value === _currentPalaId) {
      document.getElementById('pm-comp-msg').textContent =
        'Esta pala ya está en el comparador.';
      document.getElementById('pm-btn-go-comp').style.display = '';
      return;
    }
  }

  // Find first empty slot
  for (const id of selIds) {
    const sel = document.getElementById(id);
    if (sel && !sel.value) {
      sel.value = _currentPalaId;
      renderComp();
      const pala = PALAS.find(p => p.id === _currentPalaId);
      document.getElementById('pm-comp-msg').textContent =
        `"${pala ? pala.nombre : _currentPalaId}" agregada al comparador.`;
      document.getElementById('pm-btn-go-comp').style.display = '';
      return;
    }
  }

  // All 3 slots full
  document.getElementById('pm-comp-msg').textContent =
    'El comparador ya tiene 3 palas seleccionadas.';
  document.getElementById('pm-btn-go-comp').style.display = '';
}

/** Navigate to comparador section */

function goToComparador() {
  closePalaModal();
  const btn = [...document.querySelectorAll('.nav-btn')]
    .find(b => b.textContent.trim() === 'Comparador');
  if (btn) btn.click();
}

// Escape key closes pala modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const pm = document.getElementById('modal-pala');
    if (pm && pm.classList.contains('open')) closePalaModal();
  }
});
