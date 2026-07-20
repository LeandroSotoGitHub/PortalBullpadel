function recSelect(qNum, value, el) {
  recAnswers[qNum] = value;
  el.closest('.rec-options').querySelectorAll('.rec-option')
    .forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}


function scorePala(pala, ans) {
  let score = 0;
  const rawChips = [];

  const genero    = ans[0] || '';
  const nivel     = ans[1] || '';
  const prioridad = ans[2] || '';
  const estilo    = ans[3] || '';
  const sensacion = ans[4] || '';
  const necesidad = ans[5] || '';

  const textoTotal = [
    pala.nivel, pala.estilo, pala.forma, pala.balance,
    pala.exterior, pala.interior, pala.tacto,
    pala.perfilJugador, pala.sensacionJuego,
    pala.argumentoVenta, pala.descTecnica,
    ...(pala.tecnologias || []), ...(pala.materiales || [])
  ].join(' ');

  const estiloN = normalizarTexto(pala.estilo || '');
  const nivelN  = normalizarTexto(pala.nivel  || '');
  // ── Q0: Tipo de pala (soft signal — suma, nunca excluye) ─────────────────
  const tipoBuscado = genero; // ans[0] reutilizado como tipo
  if (tipoBuscado === 'w') {
    if (pala.tipo_pala === 'w') { score += 18; rawChips.push('linea w'); }
    // También boost si pala es liviana/cómoda aunque no sea W
    if (hayPalabra(textoTotal, ['liviana','ligera','manejable','facil','comoda'])) { score += 6; }
  }
  if (tipoBuscado === 'standard') {
    if (pala.tipo_pala === 'standard') { score += 10; rawChips.push('estandar adulto'); }
  }
  // tipoBuscado === 'indistinto' o sin respuesta → sin ajuste

  // ── Q1: Nivel ───────────────────────────────────────────────────────────
  if (nivel && pala.nivel) {
    const q = normalizarTexto(nivel);
    if (nivelN.includes(q) || q.includes(nivelN.split(' ')[0])) {
      score += 30; rawChips.push('nivel');
    } else if (
      (nivel==='Avanzado'    && nivelN.includes('profesional')) ||
      (nivel==='Profesional' && nivelN.includes('avanzado'))    ||
      (nivel==='Intermedio'  && nivelN.includes('amateur'))     ||
      (nivel==='Amateur'     && nivelN.includes('intermedio'))
    ) { score += 12; }
    // PROLINE available to all but gets a mild bonus only for higher levels
    const isPROLINE = pala.linea === 'PROLINE';
    const isBasicLevel = ['Iniciación','Amateur','Junior'].includes(nivel);
    if (isPROLINE && isBasicLevel) { score -= 5; } // soft penalty, not exclusion
  }

  // ── Q2: Prioridad ────────────────────────────────────────────────────────
  if (prioridad === 'potencia') {
    if (estiloN.includes('ofensivo'))                       { score += 22; rawChips.push('ofensivo'); }
    if (hayPalabra(textoTotal, ['potencia','ataque','explosiv','smash','remate','definicion','peso de bola'])) { score += 15; rawChips.push('potencia'); }
    if (normalizarTexto(pala.balance||'').includes('alto')) { score += 10; rawChips.push('balance alto'); }
    if (['Diamante','Geométrica'].includes(pala.forma))     { score += 7; }
  }
  if (prioridad === 'control') {
    if (estiloN.includes('defensiv') || estiloN.includes('control')) { score += 22; rawChips.push('control'); }
    if (hayPalabra(textoTotal, ['control','precision','defensa','manejabilidad','tecnico','tecnica'])) { score += 15; rawChips.push('control'); }
    if (normalizarTexto(pala.balance||'').includes('bajo')) { score += 10; rawChips.push('balance bajo'); }
    if (['Redonda','Híbrida','Lágrima'].includes(pala.forma)) { score += 7; }
  }
  if (prioridad === 'confort') {
    if (hayPalabra(textoTotal, ['confort','cloud','elastic','soft','suave','amortiguacion','comodo','comodidad','menos exigente','amable'])) { score += 28; rawChips.push('confort'); }
    if ((pala.materiales||[]).some(m => ['EF','CE','SE','FX'].includes(m))) { score += 14; rawChips.push('confort'); }
    if ((pala.tecnologias||[]).some(t => ['Vibradrive','Hesacore'].includes(t))) { score += 10; rawChips.push('confort'); }
  }
  if (prioridad === 'polivalencia') {
    if (estiloN.includes('polivalente'))                    { score += 28; rawChips.push('polivalente'); }
    if (hayPalabra(textoTotal, ['equilibrio','versatil','polivalente','todas las situaciones','completo'])) { score += 14; rawChips.push('polivalente'); }
    if (['Híbrida','Lágrima'].includes(pala.forma))         { score += 8; }
  }
  if (prioridad === 'salida') {
    if (hayPalabra(textoTotal, ['salida de bola','reaccion','rebote','velocidad de bola','nucleo','elasticidad'])) { score += 22; rawChips.push('salida de bola'); }
    if ((pala.materiales||[]).some(m => ['ME','BE','EL'].includes(m))) { score += 10; rawChips.push('salida de bola'); }
  }
  if (prioridad === 'manejabilidad') {
    if (hayPalabra(textoTotal, ['manejo','manejable','agil','rapida','ligera','facil','velocidad de mano'])) { score += 22; rawChips.push('fácil de usar'); }
    if (normalizarTexto(pala.balance||'').includes('bajo')) { score += 10; rawChips.push('balance bajo'); }
    const pesoMin = parseInt((pala.peso||'').replace(/[^0-9]/g,'')) || 999;
    if (pesoMin <= 360) { score += 8; rawChips.push('peso ligero'); }
  }

  // ── Q3: Estilo ───────────────────────────────────────────────────────────
  if (estilo && estilo !== 'no_sabe') {
    const eq = normalizarTexto(estilo);
    if (estiloN.includes(eq)) { score += 20; rawChips.push('estilo ' + estilo.toLowerCase()); }
    else if (estiloN.includes('polivalente')) { score += 6; }
  }

  // ── Q4: Sensación ────────────────────────────────────────────────────────
  if (sensacion === 'facil' || sensacion === 'comoda') {
    if (hayPalabra(textoTotal, ['facil','comod','suave','accesible','menos exigente','amable','perdona'])) { score += 12; rawChips.push('fácil de usar'); }
    if ((pala.materiales||[]).some(m => ['EF','CE','SE','FX','PG','EL'].includes(m))) { score += 8; rawChips.push('confort'); }
  }
  if (sensacion === 'firme') {
    if (hayPalabra(textoTotal, ['firme','precis','rigido','seco','directo','cristal','carbon'])) { score += 12; rawChips.push('firme / precisa'); }
    if ((pala.materiales||[]).some(m => ['T18','X12','X3','A18'].includes(m))) { score += 8; rawChips.push('carbono de alto rendimiento'); }
  }
  if (sensacion === 'equilibrada') {
    if (estiloN.includes('polivalente')) { score += 12; rawChips.push('equilibrada'); }
    if (hayPalabra(textoTotal, ['equilibr','versati','completo'])) { score += 8; rawChips.push('equilibrada'); }
  }

  // ── Q5: Necesidad ────────────────────────────────────────────────────────
  if (necesidad === 'mas_potencia') {
    if (estiloN.includes('ofensivo'))                       { score += 14; rawChips.push('ofensivo'); }
    if (hayPalabra(textoTotal, ['potencia','smash','ataque','explosiv','remate'])) { score += 14; rawChips.push('potencia'); }
    if (normalizarTexto(pala.balance||'').includes('alto')) { score += 8; }
  }
  if (necesidad === 'mas_control') {
    if (estiloN.includes('defensiv') || estiloN.includes('control')) { score += 14; rawChips.push('control'); }
    if (hayPalabra(textoTotal, ['control','defensa','tecnic','precision'])) { score += 14; rawChips.push('control en defensa'); }
  }
  if (necesidad === 'salida_bola') {
    if (hayPalabra(textoTotal, ['salida','reaccion','rebote','bola sale'])) { score += 18; rawChips.push('salida de bola'); }
  }
  if (necesidad === 'menos_vibracion') {
    if (hayPalabra(textoTotal, ['confort','cloud','elastic','soft','hesacore','vibradrive','amortiguacion','suave'])) { score += 20; rawChips.push('confort'); }
    if ((pala.tecnologias||[]).some(t => ['Vibradrive','Hesacore'].includes(t))) { score += 12; rawChips.push('anti-vibración'); }
  }
  if (necesidad === 'mas_efecto') {
    if (hayPalabra(textoTotal, ['efecto','spin','topspin','grain','rugoso','grip'])) { score += 20; rawChips.push('genera efecto'); }
    if ((pala.tecnologias||[]).some(t => ['Topspin','3D Grain'].includes(t))) { score += 14; rawChips.push('superficie para spin'); }
  }

  // ── Deduplicate chips: keep only 1 per concept ────────────────────────
  const conceptMap = {
    'ofensivo':                   'Estilo ofensivo',
    'control':                    'Control',
    'control en defensa':         'Control en defensa',
    'potencia':                   'Potencia',
    'confort':                    'Confort',
    'anti-vibración':             'Anti-vibración',
    'fácil de usar':              'Fácil de usar',
    'polivalente':                'Polivalente',
    'equilibrada':                'Equilibrada',
    'balance alto':               'Balance alto',
    'balance bajo':               'Balance bajo',
    'salida de bola':             'Salida de bola',
    'genera efecto':              'Genera efecto',
    'superficie para spin':       'Superficie para spin',
    'firme / precisa':            'Firme / precisa',
    'carbono de alto rendimiento':'Material de alto rendimiento',
    'peso ligero':                'Peso ligero',
    'nivel':                      null, // internal only
    'linea w':                    'Línea W',
    'estandar adulto':            'Estándar / adulto',
  };
  const seen = new Set();
  const chips = [];
  for (const raw of rawChips) {
    const label = conceptMap[raw];
    if (label === null || label === undefined) continue;
    if (!seen.has(label)) { seen.add(label); chips.push(label); }
    if (chips.length >= 4) break;
  }
  // Add estilo chip if style was selected and matches
  if (estilo && estilo !== 'no_sabe' && estiloN.includes(normalizarTexto(estilo)) && !seen.has('Estilo '+estilo)) {
    if (chips.length < 4) chips.push('Estilo ' + estilo);
  }

  return { score, chips };
}

/* ── Rank ───────────────────────────────────────────────────────────────── */

/**
 * Define el pool de candidatas para la recomendación principal según nivel.
 * Devuelve un array de líneas permitidas.
 */

function poolPrincipalPorNivel(nivel) {
  switch (nivel) {
    case 'Profesional': return ['PROLINE'];
    case 'Avanzado':    return ['PROLINE'];
    case 'Intermedio':  return ['PROLINE','NEXT','ADVANCE','ONYX'];
    case 'Amateur':     return ['TOUR','ADVANCE','NEXT','PROLINE','ONYX'];
    case 'Iniciación':  return ['TOUR','ADVANCE','NEXT','ONYX'];
    case 'Junior':      return ['JUNIOR','ADVANCE'];
    default:            return null; // null = sin restricción de pool
  }
}


function recomendarPalas(ans, n) {
  n = n || 3;
  const nivel       = ans[1] || '';
  const tipoBuscado = ans[0] || 'indistinto';

  // Score all palas
  const ranked = PALAS.map(p => {
    const r = scorePala(p, ans);
    return { pala: p, score: r.score, chips: r.chips, forcedProline: false };
  }).sort((a, b) => b.score - a.score);

  // ── Apply tipo_pala soft pool for secondary ordering ────────────────────
  let orderedForSlots;
  if (tipoBuscado === 'w') {
    const wPool  = ranked.filter(r => r.pala.tipo_pala === 'w');
    const rest   = ranked.filter(r => r.pala.tipo_pala !== 'w');
    orderedForSlots = [...wPool, ...rest];
  } else if (tipoBuscado === 'standard') {
    const stdPool = ranked.filter(r => r.pala.tipo_pala === 'standard');
    const rest    = ranked.filter(r => r.pala.tipo_pala !== 'standard');
    orderedForSlots = [...stdPool, ...rest];
  } else {
    orderedForSlots = ranked;
  }

  // ── Slot 0: recomendación principal ────────────────────────────────────
  const allowedLines = poolPrincipalPorNivel(nivel);
  let principal;

  if (allowedLines) {
    // Pick best-scoring pala whose linea is in the allowed pool
    principal = orderedForSlots.find(r => allowedLines.includes(r.pala.linea));
    // Fallback: if no match in pool (edge case), take overall best
    if (!principal) principal = orderedForSlots[0];
  } else {
    principal = orderedForSlots[0];
  }

  // ── Slots 1-2: alternativas ────────────────────────────────────────────
  const usedIds = new Set([principal.pala.id]);
  const rest = orderedForSlots.filter(r => !usedIds.has(r.pala.id));

  // For Avanzado/Profesional: try to fill slot 1 also from PROLINE
  let slot1, slot2;
  if (['Avanzado','Profesional'].includes(nivel)) {
    slot1 = rest.find(r => r.pala.linea === 'PROLINE') || rest[0];
    usedIds.add(slot1.pala.id);
    slot2 = rest.find(r => !usedIds.has(r.pala.id));
  } else {
    slot1 = rest[0];
    usedIds.add(slot1.pala.id);
    slot2 = rest.find(r => !usedIds.has(r.pala.id));
  }

  const top = [principal, slot1, slot2].filter(Boolean);

  // ── Ensure at least one PROLINE in final top ──────────────────────────
  const hasProline = top.some(r => r.pala.linea === 'PROLINE');
  if (!hasProline) {
    const topIds     = new Set(top.map(r => r.pala.id));
    const prolinePool = (tipoBuscado === 'w')
      ? ranked.filter(r => r.pala.linea === 'PROLINE' &&
          (r.pala.tipo_pala === 'w' ||
           hayPalabra([r.pala.sensacionJuego, r.pala.perfilJugador].join(' '), ['liviana','ligera','comoda'])) &&
          !topIds.has(r.pala.id))
      : ranked.filter(r => r.pala.linea === 'PROLINE' && !topIds.has(r.pala.id));

    const bestProline = prolinePool[0] ||
      ranked.find(r => r.pala.linea === 'PROLINE' && !topIds.has(r.pala.id));

    if (bestProline && top.length >= n) {
      bestProline.forcedProline = true;
      bestProline.chips = [...new Set(['PROLINE', 'Mayor prestación', ...bestProline.chips])].slice(0, 4);
      top[n - 1] = bestProline;
    } else if (bestProline) {
      bestProline.forcedProline = true;
      bestProline.chips = [...new Set(['PROLINE', 'Mayor prestación', ...bestProline.chips])].slice(0, 4);
      top.push(bestProline);
    }
  }

  return top.slice(0, n);
}


/* ── Detect if a pala is "premium" relative to the user's level ─────────── */

function esPremiumParaNivel(pala, nivel) {
  const basicLevels = ['Iniciación','Amateur','Junior','Intermedio'];
  return basicLevels.includes(nivel) && pala.linea === 'PROLINE';
}

/* ── Labels for alt cards ────────────────────────────────────────────────── */

function etiquetaAlternativa(pala, ans, idx, forcedProline) {
  if (idx === 0) return { label: 'Recomendación principal', cls: 'top' };

  // Forced PROLINE slot — clear label
  if (forcedProline) return { label: 'Alternativa PROLINE', cls: 'premium' };

  const prioridad = ans[2] || '';
  const estiloN   = normalizarTexto(pala.estilo || '');
  const textoN    = normalizarTexto([pala.descTecnica, pala.sensacionJuego, pala.perfilJugador].join(' '));

  // Descriptive label based on pala profile — no premium badge for organic top-3
  if (prioridad === 'confort' || hayPalabra(textoN, ['comod','suave','elastic','cloud'])) return { label: 'Alternativa más confortable', cls: 'alt' };
  if (estiloN.includes('polivalente')) return { label: 'Alternativa más equilibrada', cls: 'alt' };
  if (estiloN.includes('ofensivo'))    return { label: 'Alternativa más técnica', cls: 'alt' };
  if (estiloN.includes('defensiv'))    return { label: 'Alternativa más fácil de usar', cls: 'alt' };
  return { label: 'Alternativa de mayor prestación', cls: 'alt' };
}

/* ── Perfil resumen ──────────────────────────────────────────────────────── */

function generarResumenPerfil(ans) {
  const partes = [];
  const mapGenero = { 'w':'prefiere línea W / más liviana', 'standard':'prefiere pala estándar / adulto', 'indistinto':null };
  const mapNivel  = { 'Iniciación':'jugador en iniciación', 'Amateur':'jugador amateur', 'Intermedio':'jugador intermedio', 'Avanzado':'jugador avanzado', 'Profesional':'jugador profesional / competitivo', 'Junior':'jugador junior' };
  const mapPrior  = { 'potencia':'busca potencia', 'control':'busca control', 'confort':'busca confort', 'polivalencia':'busca polivalencia', 'salida':'busca buena salida de bola', 'manejabilidad':'busca manejabilidad' };
  const mapEstilo = { 'Ofensivo':'estilo ofensivo', 'Defensivo':'estilo defensivo', 'Polivalente':'estilo polivalente', 'no_sabe':'estilo a definir' };
  const mapSens   = { 'facil':'sensación fácil de manejar', 'equilibrada':'sensación equilibrada', 'firme':'sensación firme y precisa', 'comoda':'sensación cómoda' };
  const mapNec    = { 'mas_potencia':'necesita más potencia', 'mas_control':'necesita más control en defensa', 'salida_bola':'necesita mejor salida de bola', 'menos_vibracion':'necesita sensación más cómoda al impacto', 'mas_efecto':'necesita más efecto', 'no_sabe':null };
  const genLabel = ans[0] && mapGenero[ans[0]];
  if (genLabel) partes.push(genLabel);
  if (ans[1] && mapNivel[ans[1]])  partes.push(mapNivel[ans[1]]);
  if (ans[2] && mapPrior[ans[2]])  partes.push(mapPrior[ans[2]]);
  if (ans[3] && mapEstilo[ans[3]]) partes.push(mapEstilo[ans[3]]);
  if (ans[4] && mapSens[ans[4]])   partes.push(mapSens[ans[4]]);
  const nec = ans[5] && mapNec[ans[5]];
  if (nec) partes.push(nec);
  return partes.length ? partes.join(' · ') : 'Perfil no especificado';
}

/* ── Explicación ─────────────────────────────────────────────────────────── */

function explicarRecomendacion(pala, ans, chips, idx, forcedProline) {
  const nivel     = ans[1] || '';
  const prioridad = ans[2] || '';
  const estilo    = ans[3] || '';
  const premium   = esPremiumParaNivel(pala, nivel);
  const textoN    = normalizarTexto([pala.sensacionJuego, pala.perfilJugador, pala.descTecnica].join(' '));

  let base = '';

  if (forcedProline) {
    // Premium explanation for basic-level user
    const razon = prioridad === 'confort'      ? 'combina una sensación cómoda y amable al impacto con buen rendimiento'
                : prioridad === 'control'      ? 'ofrece un nivel de control y precisión difícil de encontrar en gamas básicas'
                : prioridad === 'salida'       ? 'tiene una reacción de núcleo que la hace muy accesible y con gran salida de bola'
                : prioridad === 'polivalencia' ? 'responde bien en defensa y ataque sin exigir una técnica muy afinada'
                : 'su combinación de materiales y tecnologías la hace más accesible de lo que su línea sugiere';
    if (forcedProline) {
      base = 'Además de las opciones más alineadas al perfil, esta pala aparece como alternativa PROLINE para mostrar una opción de mayor prestación. Puede tener sentido si el jugador quiere dar un salto de calidad y acceder a una pala con más tecnología y rendimiento.';
    } else {
      base = 'Si bien es una pala de mayores prestaciones, puede tener sentido para este perfil porque ' + razon + '. La presentaría como una opción para quien quiere dar un salto de calidad sin cambiar su estilo de juego.';
    }
  } else {
    // Standard explanation
    const coincidencias = chips.slice(0,3).join(', ').toLowerCase();
    const perfilResumen = nivel ? 'Para un ' + nivel.toLowerCase() : 'Para este perfil';
    const prioStr = prioridad ? ' que prioriza ' + prioridad : '';
    const estiloStr = estilo && estilo !== 'no_sabe' ? ' con juego ' + estilo.toLowerCase() : '';
    base = perfilResumen + prioStr + estiloStr + ', esta pala encaja bien' +
      (coincidencias ? ' porque destaca en ' + coincidencias : '') + '.';
    if (pala.perfilJugador) {
      const frag = pala.perfilJugador.split('.')[0];
      if (frag && frag.length < 120) base += ' ' + frag + '.';
    }
  }
  return base;
}

/* ── Frase de venta ──────────────────────────────────────────────────────── */

function fraseVenta(pala, ans, idx, forcedProline) {
  const prioridad = ans[2] || '';
  const premium   = esPremiumParaNivel(pala, ans[1] || '');

  if (forcedProline) {
    return 'Si querés ofrecer una opción premium dentro de Bullpadel, esta PROLINE puede funcionar como alternativa de mayor prestación, manteniendo relación con la necesidad indicada por el jugador.';
  }


  const mapaFrases = {
    potencia:     'Por lo que me contás, esta pala te puede dar la potencia que buscás — genera un golpe contundente y con dirección.',
    control:      'Por lo que me contás, esta pala te va a dar seguridad — fácil de controlar y muy predecible en defensa.',
    confort:      'Para lo que buscás, esta pala tiene una sensación muy amable al impacto y es fácil de usar todo el partido.',
    polivalencia: 'Esta pala te acompaña en todas las situaciones — no te va a limitar si querés atacar o defender.',
    salida:       'Por lo que me contás, esta pala tiene muy buena reacción de núcleo — la bola sale con facilidad incluso en golpes suaves.',
    manejabilidad:'Es fácil de mover y muy rápida en la mano — una pala que no te pesa y que responde bien.',
  };
  return mapaFrases[prioridad] || 'Esta pala encaja bien con el perfil del jugador y es una buena base para recomendar con confianza.';
}

/* ── Render ──────────────────────────────────────────────────────────────── */

function renderResultadosRecomendador(resultados) {
  const el = document.getElementById('rec-results');
  if (!el) return;
  if (!resultados.length) {
    el.innerHTML = '<div class="rec-empty"><div class="rec-empty-icon">&#128269;</div><div class="rec-empty-title">Sin resultados</div><div class="rec-empty-sub">Respond\u00e9 al menos una pregunta para obtener recomendaciones.</div></div>';
    return;
  }

  // Perfil resumen
  const resumen = generarResumenPerfil(recAnswers);
  const resumenHtml = '<div class="rec-perfil-resumen"><span class="rec-perfil-label">Perfil detectado:</span> ' + resumen + '</div>';

  const cards = resultados.map(({ pala, score, chips, forcedProline }, idx) => {
    const { label, cls } = etiquetaAlternativa(pala, recAnswers, idx, forcedProline);
    const why   = explicarRecomendacion(pala, recAnswers, chips, idx, forcedProline);
    const frase = fraseVenta(pala, recAnswers, idx, forcedProline);
    const imgSrc = palaImgSrc(pala.id);
    const imgHtml = imgSrc
      ? '<img src="'+imgSrc+'" alt="'+pala.nombre+'" style="max-height:120px;max-width:100%;object-fit:contain">'
      : '<div class="rec-card-img-placeholder" style="font-size:11px;font-weight:800;color:#aaa;text-transform:uppercase;letter-spacing:.05em">SIN<br>FOTO</div>';
    const chipsHtml = chips.length
      ? chips.map(ch => '<span class="rec-chip'+(cls==='premium'?' premium':'')+'">' + ch + '</span>').join('')
      : '<span class="rec-chip neutral">Coincidencia general</span>';

    return '<div class="rec-card '+cls+'">' +
      '<div class="rec-card-rank '+cls+'">' + (idx===0?'&#9733; ':'') + label + '</div>' +
      '<div class="rec-card-img-wrap">'+imgHtml+'</div>' +
      '<div class="rec-card-body">' +
        '<div class="rec-card-linea"><span class="linea-tag tag-'+(pala.linea||'')+'">'+(pala.linea||'')+'</span></div>' +
        '<div class="rec-card-nombre">'+pala.nombre+'</div>' +
        '<div class="rec-card-specs">' +
          '<div class="rec-card-spec"><strong>Nivel</strong> '+(pala.nivel||'&mdash;')+'</div>' +
          '<div class="rec-card-spec"><strong>Estilo</strong> '+(pala.estilo||'&mdash;')+'</div>' +
          '<div class="rec-card-spec"><strong>Forma</strong> '+(pala.forma||'&mdash;')+'</div>' +
          '<div class="rec-card-spec"><strong>Balance</strong> '+(pala.balance||'&mdash;')+'</div>' +
        '</div>' +
        '<div class="rec-card-chips">'+chipsHtml+'</div>' +
        '<div class="rec-card-why '+(idx===0?'top':'')+'">' + why + '</div>' +
        '<div class="rec-card-frase">&ldquo;' + frase + '&rdquo;</div>' +
        '<div class="rec-card-actions">' +
          '<button class="rec-card-btn primary" onclick="openPalaModal(\''+pala.id+'\')">Ver ficha</button>' +
          '<button class="rec-card-btn secondary" onclick="recAgregarComparador(\''+pala.id+'\')">Comparar</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  // Store current result ids for the compare-all button
  _recResultIds = resultados.map(r => r.pala.id);

  const compareAllBtn = _recResultIds.length > 1
    ? '<button class="rec-compare-all-btn" onclick="goToComparadorConPalas(_recResultIds)">&#9878; Comparar las ' + _recResultIds.length + ' recomendaciones</button>'
    : '';

  el.innerHTML =
    '<div class="rec-results-toolbar">' +
      '<div><div class="rec-results-title">Tus recomendaciones</div>' +
      '<div class="rec-results-sub">Bas\u00e1ndote en el perfil indicado &mdash; pod\u00e9s ajustar las respuestas y volver a calcular.</div></div>' +
      compareAllBtn +
    '</div>' +
    resumenHtml +
    '<div class="rec-cards">' + cards + '</div>';

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ── Comparar las 3 recomendaciones ─────────────────────────────────────── */

function goToComparadorConPalas(ids, source) {
  const selIds = ['c1', 'c2', 'c3'];
  source = source || 'recomendador';

  // Build compareContext only when coming from recomendador
  if (source === 'recomendador') {
    const profileText = generarResumenPerfil(recAnswers);
    compareContext = {
      source:      'recomendador',
      profileText: profileText && profileText !== 'Perfil no especificado' ? profileText : null,
      answers:     Object.assign({}, recAnswers)
    };
  } else {
    // Coming from another flow (e.g. Mapa competitivo) — no recomendador profile
    compareContext = null;
  }

  // Flag: programmatic update — prevents select onChange from clearing context
  _isProgrammaticCompare = true;

  // Clear selects
  selIds.forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.value = '';
  });
  // Load palas
  ids.forEach((palaId, idx) => {
    if (!palaId || idx >= selIds.length) return;
    const sel = document.getElementById(selIds[idx]);
    const exists = PALAS.some(p => p.id === palaId);
    if (sel && exists) sel.value = palaId;
  });

  // Render and navigate
  renderComp();
  const btn = [...document.querySelectorAll('.nav-btn')]
    .find(b => b.textContent.trim() === 'Comparador');
  if (btn) btn.click();
  // Ensure Comparador Bullpadel tab is active (not Mapa) after navigating
  setTimeout(() => { if (typeof showComparadorTab === 'function') showComparadorTab('bullpadel', null); }, 30);

  // Reset flag after render cycle
  setTimeout(() => { _isProgrammaticCompare = false; }, 100);
}


function calcularRecomendacion() {
  renderResultadosRecomendador(recomendarPalas(recAnswers, 3));
}


function recAgregarComparador(palaId) {
  const selIds = ['c1','c2','c3'];
  for (const id of selIds) {
    const sel = document.getElementById(id);
    if (sel && !sel.value) {
      sel.value = palaId;
      renderComp();
      const btn = [...document.querySelectorAll('.nav-btn')].find(b => b.textContent.trim() === 'Comparador');
      if (btn) btn.click();
      return;
    }
  }
  alert('El comparador ya tiene 3 palas. Abriendo la ficha de la pala.');
  openPalaModal(palaId);
}


function limpiarRecomendador() {
  recAnswers = { 0: 'indistinto' };
  document.querySelectorAll('.rec-option').forEach(o => o.classList.remove('selected'));
  // Re-select Indistinto default
  const defOpt = document.querySelector('#rec-q0 .rec-option');
  if (defOpt) defOpt.classList.add('selected');
  document.getElementById('rec-results').innerHTML = '';
}


/* ═══════════════════════════════════════════════════
   HOME / DASHBOARD
   ═══════════════════════════════════════════════════ */

