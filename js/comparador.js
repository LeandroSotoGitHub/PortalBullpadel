function populateCompSelects(){
  const opts='<option value="">— elegir pala —</option>'+PALAS.map(p=>`<option value="${p.id}">${p.nombre}</option>`).join('');
  ['c1','c2','c3'].forEach(id=>document.getElementById(id).innerHTML=opts);
}


/* ── Comparador helpers ─────────────────────────────────────────────────── */


function getSelectedComparePalas() {
  return ['c1','c2','c3']
    .map(id => document.getElementById(id) ? document.getElementById(id).value : '')
    .filter(Boolean)
    .map(id => PALAS.find(p => p.id === id))
    .filter(Boolean);
}


function compNormalizeText(v) {
  if (!v) return '';
  return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ');
}


function compHasText(pala, keywords) {
  const t = compNormalizeText([
    pala.estilo, pala.exterior, pala.interior, pala.sensacionJuego,
    pala.perfilJugador, pala.argumentoVenta, pala.descTecnica,
    ...(pala.materiales||[]), ...(pala.tecnologias||[])
  ].join(' '));
  return keywords.some(k => t.includes(k));
}


function isProlinePala(p)  { return p.linea === 'PROLINE'; }
function isComfortPala(p)  { return compHasText(p, ['confort','cloud','elastic','soft','suave','amortiguacion','comoda','amable']); }
function isControlPala(p)  { return compHasText(p, ['control','defensa','precision','tecnic']) || compNormalizeText(p.estilo||'').includes('defensiv'); }
function isPowerPala(p)    { return compHasText(p, ['potencia','ataque','explosiv','smash','remate']) || compNormalizeText(p.estilo||'').includes('ofensivo'); }
function isEasyPala(p)     { return compHasText(p, ['facil','manejable','agil','ligera','accesible','perdona']); }
function isTechnicalPala(p){ return (p.linea==='PROLINE') && compHasText(p,['carbon','tricarbon','xtend','hesacore','vibradrive']); }

function buildCompareSummary(palas) {
  // If coming from recomendador, open with profile context
  if (compareContext && compareContext.profileText) {
    const ctx     = compareContext.profileText;
    const prolineP = palas.filter(isProlinePala);
    const easyP    = palas.filter(isEasyPala);
    const comfP    = palas.filter(isComfortPala);
    let opener = 'Para el perfil cargado (' + ctx + '), esta comparación ayuda a diferenciar ';
    if (prolineP.length > 0 && prolineP.length < palas.length) {
      opener += 'una opción de mayor prestación (' + prolineP[0].nombre + ')';
      const rest = palas.filter(p => !isProlinePala(p));
      if (easyP.some(p => !isProlinePala(p))) opener += ', una alternativa más fácil de manejar';
      if (comfP.some(p => !isProlinePala(p))) opener += ' y una opción más confortable';
      opener += '. La idea es que el vendedor pueda explicar qué cambia entre cada una según el nivel, el estilo y la necesidad del jugador.';
    } else {
      opener += 'las diferencias en balance, materiales y sensación de juego entre las palas seleccionadas.';
    }
    return opener;
  }

  // Standalone mode (no recomendador context)
  const prolinePalas = palas.filter(isProlinePala);
  const easyPalas    = palas.filter(isEasyPala);
  const comfortPalas = palas.filter(isComfortPala);
  const powerPalas   = palas.filter(isPowerPala);
  const controlPalas = palas.filter(p => isControlPala(p) && !isPowerPala(p));
  const multiLine    = new Set(palas.map(p => p.linea)).size > 1;

  const parts = [];

  // Opening: describe what each pala brings to the comparison by name
  if (prolinePalas.length > 0 && prolinePalas.length < palas.length) {
    const premiumNames = prolinePalas.map(p => p.nombre).join(' y ');
    const restNames    = palas.filter(p => !isProlinePala(p)).map(p => p.nombre).join(' y ');
    parts.push(
      'En esta comparación, ' + premiumNames + ' aparece como la opción de mayor prestación y perfil más técnico, ' +
      'mientras que ' + restNames + ' funciona como alternativa ' +
      (easyPalas.some(p => !isProlinePala(p)) ? 'más accesible y fácil de manejar' :
       comfortPalas.some(p => !isProlinePala(p)) ? 'más confortable y amable en el golpe' :
       'más asequible dentro de la gama') + '.'
    );
  } else if (multiLine) {
    const byLine = palas.map(p => p.nombre + ' (' + (p.linea||'') + ')').join(', ');
    parts.push('Las palas en esta comparación vienen de distintas líneas: ' + byLine + '. Cada una cubre un perfil diferente dentro de la gama Bullpadel.');
  } else {
    // Same line — differentiate by style/feel
    if (powerPalas.length > 0 && controlPalas.length > 0) {
      parts.push('Dentro de la misma línea, ' +
        powerPalas.map(p=>p.nombre).join(' y ') + ' apunta más al ataque, mientras que ' +
        controlPalas.map(p=>p.nombre).join(' y ') + ' prioriza el control y la defensa.');
    } else if (comfortPalas.length > 0 && comfortPalas.length < palas.length) {
      parts.push('Las palas son similares en línea y nivel, pero ' +
        comfortPalas.map(p=>p.nombre).join(' y ') + ' tiene una sensación más cómoda y amable al impacto.');
    } else {
      parts.push('Las palas tienen perfiles técnicos similares. Las diferencias clave están en balance, materiales y sensación de juego.');
    }
  }

  // Closing advice
  if (powerPalas.length > 0 && easyPalas.length > 0) {
    parts.push('Según el perfil del cliente, una puede servir para generar más definición en ataque y la otra para priorizar facilidad y control.');
  } else if (prolinePalas.length > 0 && prolinePalas.length < palas.length) {
    parts.push('Si el cliente tiene margen para una opción de mayor prestación, la PROLINE puede funcionar como propuesta aspiracional dentro de la conversación.');
  }

  return parts.join(' ');
}

/* Build key difference chips — max 4, no duplicates */

function buildCompareHighlights(palas) {
  const seen       = new Set();
  const highlights = [];

  function addH(label, nombre) {
    if (highlights.length >= 4) return;
    if (seen.has(label)) return;
    seen.add(label);
    highlights.push({ label, nombre });
  }

  // 1. Premier / PROLINE
  const prolinePalas = palas.filter(isProlinePala);
  if (prolinePalas.length === 1) addH('Mayor prestación', prolinePalas[0].nombre);

  // 2. Power
  const powered = palas.filter(isPowerPala);
  if (powered.length === 1) addH('Más ofensiva', powered[0].nombre);

  // 3. Control (only if not already covered by power)
  const ctrl = palas.filter(p => isControlPala(p) && !isPowerPala(p));
  if (ctrl.length === 1) addH('Más orientada al control', ctrl[0].nombre);

  // 4. Comfort
  const comf = palas.filter(isComfortPala);
  if (comf.length === 1) addH('Más confortable', comf[0].nombre);

  // 5. Easy (only if comfort not already shown for same pala)
  const easy = palas.filter(isEasyPala);
  if (easy.length === 1 && !(comf.length === 1 && comf[0].id === easy[0].id)) {
    addH('Más fácil de usar', easy[0].nombre);
  }

  // 6. Balance
  const highBal = palas.filter(p => compNormalizeText(p.balance||'').includes('alto') || compNormalizeText(p.balance||'').includes('26'));
  if (highBal.length === 1) addH('Balance más alto', highBal[0].nombre);

  // 7. Lightest (only if meaningful difference)
  const weights = palas.map(p => ({ p, w: parseInt((p.peso||'400').replace(/[^0-9]/g,'')) || 400 }));
  const minW = Math.min(...weights.map(x => x.w));
  const maxW = Math.max(...weights.map(x => x.w));
  if (maxW - minW >= 10) {
    const lightest = weights.find(x => x.w === minW);
    if (lightest) addH('Más liviana', lightest.p.nombre);
  }

  return highlights;
}

/* Commercial label for each pala in context */

function getPalaCommercialLabel(pala, palas) {
  if (isProlinePala(pala) && !palas.every(isProlinePala)) return 'Opción de mayor prestación';
  if (isPowerPala(pala) && !palas.every(isPowerPala)) return 'Opción más ofensiva';
  if (isControlPala(pala) && !isPowerPala(pala)) return 'Opción más orientada al control';
  if (isComfortPala(pala)) return 'Opción más confortable';
  if (isEasyPala(pala)) return 'Opción más fácil de usar';
  if (compNormalizeText(pala.estilo||'').includes('polivalente')) return 'Opción más equilibrada';
  return 'Alternativa complementaria';
}

/* Sales phrase aligned with commercial label */

function buildPalaSalesPhrase(pala, palas) {
  const label = getPalaCommercialLabel(pala, palas);
  const ctx   = compareContext && compareContext.profileText ? compareContext.profileText : null;
  const pfx   = ctx ? 'Para este perfil, ' : '';

  if (label === 'Opción de mayor prestación') {
    return pfx + 'esta opción funciona como alternativa de mayor prestación. La mostraría a un jugador que quiere sostener control y sumar una pala más técnica dentro de la gama Bullpadel.';
  }
  if (label === 'Opción más ofensiva') {
    return 'Esta opción encaja mejor con un jugador que quiere tomar la iniciativa, acelerar la bola y buscar mayor definición en el ataque.';
  }
  if (label === 'Opción más orientada al control') {
    return pfx + 'esta opción tiene sentido para un jugador que prioriza control, seguridad y buena respuesta desde el fondo de la pista.';
  }
  if (label === 'Opción más confortable') {
    return pfx + 'esta opción puede servir si el cliente busca una sensación más cómoda, amable en el golpe y menos exigente al impacto.';
  }
  if (label === 'Opción más fácil de usar') {
    return pfx + 'esta opción tiene sentido como alternativa más fácil de usar, especialmente si el jugador prioriza manejabilidad y seguridad en defensa.';
  }
  if (label === 'Opción más equilibrada') {
    return 'Esta opción es versátil y responde bien en distintas situaciones. Buena para un jugador que no quiere limitarse a un solo estilo.';
  }
  // Fallback — generic but role-neutral
  return 'Esta opción complementa bien las otras alternativas. El detalle que marca la diferencia está en su balance, materiales y sensación de juego particular.';
}

/* ── Main renderComp ───────────────────────────────────────────────────── */

function renderComp() {
  const palas = getSelectedComparePalas();
  const r     = document.getElementById('comp-result');

  if (palas.length < 2) {
    r.innerHTML = '<div class="comp-empty">' +
      '<div class="comp-empty-title">Seleccioná 2 o 3 palas para comparar</div>' +
      '<div class="comp-empty-sub">Elegí las palas en los selectores de arriba y el comparador generará un análisis técnico y comercial.</div>' +
    '</div>';
    return;
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const summary = buildCompareSummary(palas);
  const summaryHtml = '<div class="comp-summary">' +
    '<div class="comp-summary-label">Resumen de comparación</div>' +
    summary +
  '</div>';

  // ── Highlights ─────────────────────────────────────────────────────────
  const highlights = buildCompareHighlights(palas);
  const highlightsHtml = highlights.length ? (
    '<div class="comp-highlights-title">Diferencias clave</div>' +
    '<div class="comp-highlights">' +
      highlights.map(h =>
        '<div class="comp-highlight-chip">' +
          '<span class="chip-label">' + h.label + '</span>' +
          h.nombre +
        '</div>'
      ).join('') +
    '</div>'
  ) : '';

  // ── Table ──────────────────────────────────────────────────────────────
  const matNombres = p => (p.materiales||[]).map(cod => {
    const m = MATERIALES.find(m => m.cod===cod||m.id===cod);
    return m ? m.nombre : cod;
  }).join(', ') || '—';

  const rows = [
    ['Nivel',            p => p.nivel   || '—'],
    ['Estilo',           p => '<span class="estilo-pill ' + estiloClass(p.estilo||'') + '">' + (p.estilo||'—') + '</span>'],
    ['Forma',            p => p.forma   || '—'],
    ['Peso',             p => p.peso    || '—'],
    ['Perfil',           p => p.perfil  || '—'],
    ['Balance',          p => p.balance || '—'],
    ['Comp. exterior',   p => p.exterior|| '—'],
    ['Núcleo',           p => p.interior|| '—'],
    ['Materiales',       p => matNombres(p)],
    ['Tecnologías',      p => '<div class="comp-chips-cell">' + (p.tecnologias||[]).slice(0,5).map(t=>'<span class="comp-tech-chip">'+t+'</span>').join('') + '</div>'],
    ['Sensación',        p => p.sensacionJuego ? p.sensacionJuego.split('.')[0]+'.' : '—'],
    ['Perfil jugador',   p => p.perfilJugador  ? p.perfilJugador.split('.')[0]+'.'  : '—'],
    ['Argumento venta',  p => p.argumentoVenta  ? p.argumentoVenta.split('.')[0]+'.' : '—'],
  ];

  const tableHtml = '<div class="comp-table-wrap"><table class="comp-table">' +
    '<thead><tr>' +
      '<th>Especificación</th>' +
      palas.map(p =>
        '<th class="pala-col">' +
          '<img class="comp-pala-img" src="' + palaImgSrc(p.id) + '" alt="' + p.nombre + '" onclick="openLightbox(this.src,this.alt)">' +
          '<div class="comp-pala-nombre">' + p.nombre + '</div>' +
          '<div class="comp-pala-linea"><span class="linea-tag tag-' + (p.linea||'') + '">' + (p.linea||'') + '</span></div>' +
        '</th>'
      ).join('') +
    '</tr></thead><tbody>' +
    rows.map(([label, fn]) => {
      const vals = palas.map(fn);
      const rawVals = palas.map(p => {
        const v = fn(p); return v.replace ? v.replace(/<[^>]+>/g,'').trim() : String(v).trim();
      });
      const allSame = rawVals.every(v => v === rawVals[0]);
      return '<tr>' +
        '<td class="row-label">' + label + '</td>' +
        vals.map(v => '<td class="' + (allSame?'':'diff') + '">' + v + '</td>').join('') +
      '</tr>';
    }).join('') +
    '</tbody></table></div>' +
    '<p style="font-size:11px;color:#aaa;margin-top:6px;margin-bottom:20px">Celdas destacadas indican diferencias entre las palas seleccionadas.</p>';

  // ── How to explain ──────────────────────────────────────────────────────
  const explainHtml = '<div class="comp-explain">' +
    '<div class="comp-explain-title">Cómo explicar cada opción</div>' +
    '<div class="comp-explain-cards">' +
      palas.map(p => {
        const label = getPalaCommercialLabel(p, palas);
        const frase = buildPalaSalesPhrase(p, palas);
        return '<div class="comp-explain-card ' + (isProlinePala(p)?'proline':'') + '">' +
          '<div class="comp-explain-card-nombre">' + p.nombre + '</div>' +
          '<div class="comp-explain-card-etiqueta">' + label + '</div>' +
          '<div class="comp-explain-card-frase">' + frase + '</div>' +
        '</div>';
      }).join('') +
    '</div></div>';

  // Context block (only when coming from recomendador)
  const contextHtml = (compareContext && compareContext.profileText)
    ? '<div class="comp-context-block">' +
        '<div class="comp-context-label">Perfil detectado</div>' +
        '<div class="comp-context-text">' + compareContext.profileText + '</div>' +
      '</div>'
    : '';

  r.innerHTML = contextHtml + summaryHtml + highlightsHtml + tableHtml + explainHtml;
}



function onCompSelectChange() {
  if (!_isProgrammaticCompare && compareContext) {
    compareContext = null;
  }
  renderComp();
}
