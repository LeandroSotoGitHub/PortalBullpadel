function showComparadorTab(tab, btn) {
  // Guard: bloquear acceso a Mapa competitivo si el rol no tiene permiso
  if (tab === 'mapa') {
    const perms = (currentUser && ROLES[currentUser.rol]?.permisos) || {};
    if (perms.verCompetencia === false) {
      tab = 'bullpadel';
      btn = null;
    }
  }
  document.querySelectorAll('#subnav-comparador .subnav-btn')
    .forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const targetText = tab === 'mapa' ? 'Mapa competitivo' : 'Comparador Bullpadel';
    const targetBtn = [...document.querySelectorAll('#subnav-comparador .subnav-btn')]
      .find(b => b.textContent.trim() === targetText);
    if (targetBtn) targetBtn.classList.add('active');
  }
  document.querySelectorAll('#sec-comparador .subview')
    .forEach(v => v.classList.remove('active'));
  const sv = document.getElementById('comparador-tab-' + tab);
  if (sv) sv.classList.add('active');
  if (tab === 'mapa') populateMapaMarcaSelect();
}

/* Populate marca → modelo selects */

function populateMapaMarcaSelect() {
  const modeloSel = document.getElementById('mapa-modelo');
  if (!modeloSel || modeloSel.dataset.populated) return;
  onMapaMarcaChange(); // populate modelo list for current marca filter
  modeloSel.dataset.populated = '1';
}


function onMapaMarcaChange() {
  const marca = document.getElementById('mapa-marca').value;
  const modeloSel = document.getElementById('mapa-modelo');
  const filtered = marca ? PALAS_COMPETENCIA.filter(p => p.marca === marca) : PALAS_COMPETENCIA;

  modeloSel.innerHTML = '<option value="">— elegir modelo —</option>' +
    filtered.map(p => '<option value="' + p.id + '">' + p.marca + ' ' + p.modelo + '</option>').join('');

  _mapaSelectedId = null;
  renderMapaResult();
}


function onMapaModeloChange() {
  _mapaSelectedId = document.getElementById('mapa-modelo').value || null;
  // Sync marca select to reflect the chosen model's brand (avoids "Filtrar por marca" looking stale)
  if (_mapaSelectedId) {
    const comp = PALAS_COMPETENCIA.find(p => p.id === _mapaSelectedId);
    if (comp) {
      const marcaSel = document.getElementById('mapa-marca');
      if (marcaSel && marcaSel.value !== comp.marca) marcaSel.value = comp.marca;
    }
  }
  renderMapaResult();
}

/* Find a Bullpadel pala by exact name match */

function findPalaPorNombre(nombre) {
  if (!nombre) return null;
  return PALAS.find(p => p.nombre === nombre) || null;
}

/* ── Mini explicación por alternativa (RUN 15B.1) ───────────────────────── */

function explicarAlternativaMapa(pala, comp) {
  if (!pala) return { rol: '', explicacion: '' };

  const linea   = pala.linea || '';
  const nivel   = (pala.nivel || '').toLowerCase();
  const estilo  = (pala.estilo || '').toLowerCase();
  const forma   = (pala.forma || '').toLowerCase();
  const balance = (pala.balance || '').toLowerCase();
  const nombreN = normalizarTexto(pala.nombre || '');
  const esPremiumNivel = nivel.includes('avanzado') || nivel.includes('profesional');
  const esConfort = nombreN.includes('comfort') || nombreN.includes('cloud');
  const esHibrida = forma.includes('h\u00edbrida') || forma.includes('hibrida') || forma.includes('l\u00e1grima') || forma.includes('lagrima');
  const esAccesible = linea === 'NEXT' || linea === 'ADVANCE' || linea === 'TOUR' || linea === 'ONYX' || balance.includes('bajo');

  let rol = '';
  let explicacion = '';

  // ── PROLINE + nivel alto: la lectura premium/t\u00e9cnica ─────────────────
  if (linea === 'PROLINE' && esPremiumNivel && estilo.includes('ofensivo')) {
    rol = 'Opci\u00f3n PROLINE m\u00e1s ofensiva';
    explicacion = 'Sirve para mostrar una opci\u00f3n de mayor prestaci\u00f3n si el cliente prioriza potencia y quiere definir el punto con m\u00e1s contundencia.';
  } else if (linea === 'PROLINE' && esPremiumNivel && (estilo.includes('defensiv') || estilo.includes('control'))) {
    rol = 'Opci\u00f3n PROLINE m\u00e1s t\u00e9cnica';
    explicacion = 'Conviene mostrarla cuando el cliente busca control con una respuesta m\u00e1s precisa, sin resignar prestaciones dentro de la gama alta.';
  } else if (linea === 'PROLINE' && esPremiumNivel && estilo.includes('polivalente')) {
    rol = 'Alternativa premium m\u00e1s vers\u00e1til';
    explicacion = 'Es una buena alternativa si quer\u00e9s abrir la conversaci\u00f3n hacia una pala que no obliga a elegir entre ataque y defensa.';
  } else if (linea === 'PROLINE' && esConfort) {
    rol = 'Lectura m\u00e1s c\u00f3moda dentro de PROLINE';
    explicacion = 'Permite ofrecer una opci\u00f3n de mayor prestaci\u00f3n con una sensaci\u00f3n menos exigente al impacto, sin bajar de gama.';
  } else if (linea === 'PROLINE') {
    rol = 'Opci\u00f3n de mayor prestaci\u00f3n';
    explicacion = 'Funciona como alternativa t\u00e9cnica dentro de Bullpadel cuando el cliente busca dar un salto de calidad respecto al modelo que est\u00e1 mirando.';

  // ── Estilo ofensivo (no necesariamente PROLINE) ─────────────────────────
  } else if (estilo.includes('ofensivo') || estilo.includes('ataque')) {
    rol = 'Alternativa orientada al ataque';
    explicacion = 'Tiene sentido mostrarla si el cliente prioriza potencia y golpes de definici\u00f3n por encima de la versatilidad.';

  // ── Estilo defensivo/control ─────────────────────────────────────────────
  } else if (estilo.includes('defensiv') || estilo.includes('control')) {
    rol = esAccesible ? 'Alternativa de control m\u00e1s accesible' : 'Alternativa m\u00e1s orientada a control';
    explicacion = esAccesible
      ? 'Conviene mostrarla cuando el cliente prioriza control pero busca una opci\u00f3n m\u00e1s f\u00e1cil de adaptar al juego.'
      : 'Sirve para sostener la conversaci\u00f3n en control y precisi\u00f3n, manteniendo una propuesta de mayor prestaci\u00f3n.';

  // ── Polivalente ───────────────────────────────────────────────────────────
  } else if (estilo.includes('polivalente')) {
    rol = 'Lectura m\u00e1s polivalente';
    explicacion = 'Es \u00fatil cuando el cliente todav\u00eda no tiene definido su estilo de juego o busca una pala que acompa\u00f1e ambas fases.';

  // ── Forma h\u00edbrida/l\u00e1grima como se\u00f1al secundaria ───────────
  } else if (esHibrida) {
    rol = 'Alternativa h\u00edbrida de mayor prestaci\u00f3n';
    explicacion = 'Combina potencia y manejo, \u00fatil para abrir la conversaci\u00f3n hacia una opci\u00f3n vers\u00e1til dentro de la gama alta.';

  // ── Confort como se\u00f1al secundaria ───────────────────────────────────
  } else if (esConfort) {
    rol = 'Lectura m\u00e1s c\u00f3moda dentro de Bullpadel';
    explicacion = 'Permite responder a una necesidad similar con una sensaci\u00f3n m\u00e1s amable al impacto, sin perder rendimiento.';

  // ── Accesible / balance bajo ──────────────────────────────────────────────
  } else if (esAccesible) {
    rol = 'Opci\u00f3n m\u00e1s accesible';
    explicacion = 'Es una buena puerta de entrada si el cliente quiere algo f\u00e1cil de adaptar antes de pensar en una pala m\u00e1s exigente.';

  // ── Fallback gen\u00e9rico pero todav\u00eda con criterio ─────────────────
  } else {
    rol = 'Alternativa comparable por perfil';
    explicacion = 'Puede responder a una necesidad similar a la del modelo que el cliente est\u00e1 mirando, seg\u00fan nivel y estilo de juego.';
  }

  return { rol, explicacion };
}

/* Render the alternativa card (or missing notice) */

function renderMapaAltCard(nombreEquivalente, comp, idx) {
  if (!nombreEquivalente) return '';
  const pala = findPalaPorNombre(nombreEquivalente);
  if (!pala) {
    return '<div class="mapa-alt-missing">Modelo Bullpadel no encontrado en cat\u00e1logo: "' + nombreEquivalente + '"</div>';
  }
  const imgSrc = palaImgSrc(pala.id);
  const { rol, explicacion } = explicarAlternativaMapa(pala, comp);
  const isPrincipal = idx === 0;
  return '<div class="mapa-alt-card' + (isPrincipal ? ' principal' : '') + '">' +
    (isPrincipal ? '<div class="mapa-alt-tag">Primera lectura sugerida</div>' : '') +
    '<div class="mapa-alt-img-wrap">' +
      (imgSrc ? '<img src="' + imgSrc + '" alt="' + pala.nombre + '" onclick="openLightbox(this.src,this.alt)">' : '') +
    '</div>' +
    '<div class="mapa-alt-body">' +
      (rol ? '<div class="mapa-alt-rol">' + rol + '</div>' : '') +
      '<div class="mapa-alt-nombre">' + pala.nombre + '</div>' +
      '<div class="mapa-alt-specs">' +
        '<span class="linea-tag tag-' + (pala.linea||'') + '">' + (pala.linea||'\u2014') + '</span>' +
        '<span class="mapa-alt-sep">\u00b7</span>' + (pala.nivel||'\u2014') +
      '</div>' +
      '<div class="mapa-alt-specs">' + (pala.estilo||'\u2014') + ' \u00b7 ' + (pala.forma||'\u2014') + ' \u00b7 ' + (pala.balance||'\u2014') + '</div>' +
      (explicacion ? '<div class="mapa-alt-explicacion">' + explicacion + '</div>' : '') +
    '</div>' +
    '<div class="mapa-alt-actions">' +
      '<button class="mapa-alt-btn primary" onclick="openPalaModal(\'' + pala.id + '\')">Ver ficha</button>' +
      '<button class="mapa-alt-btn secondary" onclick="recAgregarComparador(\'' + pala.id + '\')">Comparar</button>' +
    '</div>' +
  '</div>';
}

/* Get valid Bullpadel equivalent ids for a competitor record */

function getMapaEquivalentIds(comp) {
  const nombres = [comp.bullpadelEquivalente1, comp.bullpadelEquivalente2, comp.bullpadelEquivalente3];
  return nombres
    .map(n => findPalaPorNombre(n))
    .filter(Boolean)
    .map(p => p.id);
}

/* Compare all valid Bullpadel alternatives for current competitor */

function compararAlternativasBullpadel() {
  if (!_mapaSelectedId) return;
  const comp = PALAS_COMPETENCIA.find(p => p.id === _mapaSelectedId);
  if (!comp) return;
  const ids = getMapaEquivalentIds(comp);
  if (!ids.length) {
    alert('No se encontraron alternativas Bullpadel válidas para comparar.');
    return;
  }
  goToComparadorConPalas(ids, 'mapa');
}

/* Main render */

function renderMapaResult() {
  const el = document.getElementById('mapa-result');
  if (!el) return;

  if (!_mapaSelectedId) {
    el.innerHTML = '<div class="mapa-empty">' +
      '<div class="mapa-empty-title">Eleg\u00ed una marca y un modelo de competencia</div>' +
      '<div class="mapa-empty-sub">Vas a ver alternativas Bullpadel sugeridas, el motivo de la equivalencia y un argumento comercial neutral para explicarla.</div>' +
      '<div class="mapa-empty-note">Este m\u00f3dulo est\u00e1 pensado como apoyo comercial interno. Las equivalencias deben validarse con el equipo de ventas.</div>' +
    '</div>';
    return;
  }

  const comp = PALAS_COMPETENCIA.find(p => p.id === _mapaSelectedId);
  if (!comp) { el.innerHTML = ''; return; }

  const na = v => (v === null || v === undefined || v === '') ? 'No informado' : v;

  // Pending / validated badge
  const isPending = comp.estadoEquivalenciaBullpadel && comp.estadoEquivalenciaBullpadel.toLowerCase().includes('pendiente');
  const badgeHtml = isPending
    ? '<span class="mapa-pending-badge">Pendiente validaci\u00f3n comercial</span>'
    : (comp.validadoPor ? '<span class="mapa-validated-badge">Validado</span>' : '');

  // Fecha de validación SOLO se muestra como tal si ya hay validadoPor real.
  // Si está pendiente, la fecha del Excel es carga/revisión de base, no validación comercial.
  const validadoLine = comp.validadoPor ? ('Validado por: ' + comp.validadoPor) : '';
  const fechaLine     = (comp.validadoPor && comp.fechaValidacion)
    ? ('Fecha de validaci\u00f3n: ' + comp.fechaValidacion)
    : '';
  const fechaCargaLine = (!comp.validadoPor && comp.fechaValidacion)
    ? ('Fecha de carga / revisi\u00f3n de base: ' + comp.fechaValidacion)
    : '';

  // Ficha competidor
  const precioHtml = (comp.precioPublicoArs != null)
    ? '$' + comp.precioPublicoArs.toLocaleString('es-AR')
    : 'No informado';

  const specs = [
    ['Precio público (ARS)', precioHtml],
    ['Jugador profesional', na(comp.jugadorPro)],
    ['Temporada', comp.temporada],
    ['Gama', comp.gama],
    ['Nivel', na(comp.nivel)],
    ['Estilo', na(comp.estilo)],
    ['Forma', na(comp.forma)],
    ['Balance', comp.balance ? comp.balance : (comp.balanceNota ? 'A completar (' + comp.balanceNota + ')' : 'No informado')],
    ['Peso', na(comp.peso)],
    ['Superficie', na(comp.superficie)],
    ['N\u00facleo', na(comp.nucleo)],
    ['Tacto / sensaci\u00f3n', na(comp.tactoSensacion)],
  ];

  const specsHtml = specs.map(([label, val]) =>
    '<div class="mapa-spec-item"><div class="label">' + label + '</div><div class="val">' + val + '</div></div>'
  ).join('');

  const techChips = comp.tecnologias.length
    ? '<div class="mapa-tech-chips">' + comp.tecnologias.map(t => '<span class="mapa-tech-chip">' + t + '</span>').join('') + '</div>'
    : '<div class="mapa-tech-chips"><span class="mapa-tech-chip">No informado</span></div>';

  const fortChips = comp.fortalezas.length
    ? '<div class="mapa-tech-chips">' + comp.fortalezas.map(t => '<span class="mapa-tech-chip">' + t + '</span>').join('') + '</div>'
    : '';

  const fuenteHtml = comp.fuenteOficialUrl
    ? '<a class="mapa-source-link" href="' + comp.fuenteOficialUrl + '" target="_blank" rel="noopener noreferrer">Ver ficha oficial \u2192</a>'
    : '';

  const compImgSrcVal = compImgSrc(comp.id);
  const compImgHtml = '<div class="mapa-competidor-img-wrap">' +
      '<img src="' + compImgSrcVal + '" alt="' + comp.marca + ' ' + comp.modelo + '" onclick="openLightbox(this.src,this.alt)" onerror="this.parentElement.style.display=\'none\'">' +
    '</div>';

  const fichaHtml = '<div class="mapa-competidor-card">' +
    '<div class="mapa-competidor-head">' +
      '<div class="mapa-competidor-head-main">' +
        compImgHtml +
        '<div>' +
          '<div class="mapa-competidor-marca">' + comp.marca + '</div>' +
          '<div class="mapa-competidor-modelo">' + comp.modelo + '</div>' +
        '</div>' +
      '</div>' +
      badgeHtml +
    '</div>' +
    '<div class="mapa-specs-grid">' + specsHtml + '</div>' +
    techChips +
    fortChips +
    fuenteHtml +
    (isPending ? '<div class="mapa-pending-note">' +
        'Estas equivalencias son sugeridas y est\u00e1n pendientes de validaci\u00f3n comercial interna.' +
        (fechaCargaLine ? '<br><span style="opacity:.8">' + fechaCargaLine + '</span>' : '') +
      '</div>' : '') +
    ((validadoLine || fechaLine) ? '<div class="mapa-pending-note" style="background:#f0fdf4;border-left-color:#86efac;color:#166534">' + [validadoLine, fechaLine].filter(Boolean).join(' \u00b7 ') + '</div>' : '') +
  '</div>';

  // Alternativas
  const ids = getMapaEquivalentIds(comp);
  const altCardsHtml = [comp.bullpadelEquivalente1, comp.bullpadelEquivalente2, comp.bullpadelEquivalente3]
    .map((nombre, idx) => renderMapaAltCard(nombre, comp, idx)).join('');

  const compareBtnHtml = ids.length
    ? '<button class="mapa-compare-btn" onclick="compararAlternativasBullpadel()">Comparar alternativas Bullpadel</button>'
    : '';

  // Lectura comercial unificada (motivo + argumento agrupados)
  const tieneMotivoOArgumento = comp.motivoEquivalencia || comp.argumentoComercialNeutro;
  const lecturaComercialHtml = tieneMotivoOArgumento
    ? '<div class="mapa-lectura-comercial">' +
        '<div class="mapa-lectura-head">' +
          '<div class="mapa-lectura-title">Lectura comercial de la equivalencia</div>' +
          '<div class="mapa-lectura-sub">Para tener clara la conversaci\u00f3n antes de mostrar las alternativas.</div>' +
        '</div>' +
        '<div class="mapa-lectura-body">' +
          (comp.motivoEquivalencia ?
            '<div class="mapa-lectura-block">' +
              '<div class="mapa-lectura-block-title">Qu\u00e9 tienen en com\u00fan estas alternativas</div>' +
              '<div class="mapa-lectura-block-text">' + comp.motivoEquivalencia + '</div>' +
            '</div>' : '') +
          (comp.argumentoComercialNeutro ?
            '<div class="mapa-lectura-block">' +
              '<div class="mapa-lectura-block-title">C\u00f3mo llevar la conversaci\u00f3n</div>' +
              '<div class="mapa-lectura-block-text">' + comp.argumentoComercialNeutro + '</div>' +
            '</div>' : '') +
        '</div>' +
      '</div>'
    : '';

  el.innerHTML = fichaHtml +
    '<div class="mapa-section-label">Alternativas Bullpadel sugeridas</div>' +
    '<div class="mapa-alt-cards">' + altCardsHtml + '</div>' +
    compareBtnHtml +
    lecturaComercialHtml;
}
