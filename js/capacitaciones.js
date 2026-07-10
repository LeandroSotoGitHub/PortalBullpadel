// -- CAPACITACIONES . navegacion, progreso, quiz y Guia de venta ----------
// NOTA (hallazgo de migracion): renderGuia/goGuiaStep estaban duplicadas
// palabra por palabra en el archivo original (una copia autocontenida junto
// a GUIA_STEPS, y otra identica mas adelante junto a EVENTOS), cada una con
// su propia llamada renderGuia() al cargar. Se preservan ambas copias tal
// cual para no alterar el comportamiento -- es dead code, reportado para
// decidir en una run aparte si se elimina.

function renderGuia() {
  const nav = document.getElementById('guia-nav');
  const panels = document.getElementById('guia-panels');
  if (!nav || !panels) return;

  nav.innerHTML = GUIA_STEPS.map((s, i) => `
    <div class="guia-nav-step">
      <button class="guia-nav-btn ${i===0?'active':''}" onclick="goGuiaStep(${i})">
        <div class="gnav-num">${s.num}</div>
        <div class="gnav-label">${s.nav}</div>
      </button>
      ${i < GUIA_STEPS.length-1 ? '<span class="guia-nav-arrow">›</span>' : ''}
    </div>
  `).join('');

  panels.innerHTML = GUIA_STEPS.map((s, i) => `
    <div class="guia-step-panel ${i===0?'active':''}" id="guia-panel-${i}">
      <div class="step-header">
        <div class="step-num-big">${s.num}</div>
        <div class="step-header-text">
          <div class="step-eyebrow">Paso ${s.num} de ${GUIA_STEPS.length}</div>
          <div class="step-title">${s.title}</div>
          <div class="step-subtitle">${s.subtitle}</div>
        </div>
      </div>
      ${s.content}
      <div class="step-footer">
        <button class="step-btn" onclick="goGuiaStep(${i-1})" ${i===0?'style="visibility:hidden"':''}>← Anterior</button>
        <span class="step-progress">${s.num} / ${GUIA_STEPS.length}</span>
        <button class="step-btn primary" onclick="goGuiaStep(${i+1})" ${i===GUIA_STEPS.length-1?'style="visibility:hidden"':''}>Siguiente →</button>
      </div>
    </div>
  `).join('');
}

function goGuiaStep(idx) {
  if (idx < 0 || idx >= GUIA_STEPS.length) return;
  document.querySelectorAll('.guia-step-panel').forEach((p,i) => p.classList.toggle('active', i===idx));
  document.querySelectorAll('.guia-nav-btn').forEach((b,i) => b.classList.toggle('active', i===idx));
  document.getElementById('sec-guia').scrollIntoView({behavior:'smooth', block:'start'});
}


function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  // Already embed
  const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (embedMatch) return 'https://www.youtube.com/embed/' + embedMatch[1];
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return 'https://www.youtube.com/embed/' + shortMatch[1];
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) return 'https://www.youtube.com/embed/' + watchMatch[1];
  return null;
}


function renderRecursosBlock(recursos) {
  if (!recursos) return '';
  const { videoUrl, videoLabel, infografiaUrl, infografiaLabel, frase } = recursos;
  const isValid = url => url && url !== '#' && url.startsWith('http');

  // ── Iframe embebido ──────────────────────────────────────────────────
  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;
  const iframeBlock = embedUrl ? `
    <div class="cap-video-wrap">
      <div class="cap-video-label">Video de capacitación</div>
      <div class="cap-video-ratio">
        <iframe
          src="${embedUrl}"
          title="${videoLabel || 'Video de capacitación'}"
          loading="lazy"
          frameborder="0"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>
    </div>` : '';

  // ── Botón Ver en YouTube ─────────────────────────────────────────────
  const videoBtn = videoUrl ? `<a class="cap-recurso-btn${isValid(videoUrl) ? '' : ' disabled'}"
      ${isValid(videoUrl) ? `href="${videoUrl}" target="_blank" rel="noopener noreferrer"` : ''}
      title="${videoLabel || 'Ver en YouTube'}">
    <div class="cap-recurso-icon video">▶</div>
    <div class="cap-recurso-info">
      <div class="cap-recurso-type">YouTube</div>
      <div class="cap-recurso-label">${videoLabel || (isValid(videoUrl) ? 'Ver en YouTube' : 'Pendiente')}</div>
    </div></a>` : '';

  // ── Botón Infografía ─────────────────────────────────────────────────
  const docBtn = infografiaUrl ? `<a class="cap-recurso-btn${isValid(infografiaUrl) ? '' : ' disabled'}"
      ${isValid(infografiaUrl) ? `href="${infografiaUrl}" target="_blank" rel="noopener noreferrer"` : ''}
      title="${infografiaLabel || 'Infografía'}">
    <div class="cap-recurso-icon doc">⬇</div>
    <div class="cap-recurso-info">
      <div class="cap-recurso-type">Infografía</div>
      <div class="cap-recurso-label">${infografiaLabel || (isValid(infografiaUrl) ? 'Descargar' : 'Pendiente')}</div>
    </div></a>` : '';

  // ── Frase destacada ──────────────────────────────────────────────────
  const fraseHtml = frase ? `<div class="cap-recurso-frase">"${frase}"</div>` : '';

  const hasCards = videoBtn || docBtn;

  return `<div class="cap-recursos">
    <div class="cap-recursos-head">
      <div class="cap-recursos-title">Recursos de la unidad</div>
      <div class="cap-recursos-sub">Material complementario para reforzar esta capacitación.</div>
    </div>
    <div class="cap-recursos-body">
      ${iframeBlock}
      ${hasCards ? `<div class="cap-recursos-cards">${videoBtn}${docBtn}</div>` : ''}
      ${fraseHtml}
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════

   JS · CAPACITACIONES — Navegación y render

   renderCapacitaciones · selectCapMod · selectCapUnit

   selectCapMod_silent · capNavNext · capNavPrev

   (Preparado para Run 9A: progreso y checklist)

   ═══════════════════════════════════════════════════ */




function renderCapacitaciones() {
  if (!currentUser) return;
  const sidebar = document.getElementById('cap-sidebar');
  const main    = document.getElementById('cap-main');
  if (!sidebar || !main) return;

  const cl = getCapChecklist();
  const qr = getCapQuizResults();

  // ── Sidebar ──────────────────────────────────────────────────────────
  sidebar.innerHTML = '<div class="cap-sidebar-title">Módulos</div>' +
    CAPACITACIONES.map((mod, mi) => {
      const prog = getModuleProgress(mi);
      const unitBtns = mod.units.map((u, ui) => {
        const done = isCapUnitComplete(mi, ui);
        return '<button class="cap-unit-btn' + (ui===0&&mi===0?' active':'') + '" id="cap-unit-btn-'+mi+'-'+ui+'" onclick="selectCapUnit('+mi+','+ui+')">' +
               u.title + '<span class="cap-unit-check ' + (done?'done':'todo') + '" id="cap-unit-ck-'+mi+'-'+ui+'">' + (done?'\u2713':'\u25cb') + '</span></button>';
      }).join('');
      return '<div>' +
        '<button class="cap-mod-btn' + (mi===0?' active':'') + '" id="cap-mod-btn-'+mi+'" onclick="selectCapMod('+mi+')">' +
          '<div class="cap-mod-num">'+mod.num+'</div>' +
          '<div class="cap-mod-info">' +
            '<div class="cap-mod-label">'+mod.label+'</div>' +
            '<div class="cap-mod-name">'+mod.name+'</div>' +
            '<div class="cap-mod-progress" id="cap-mod-prog-'+mi+'">'+prog.done+'/'+prog.total+' completadas</div>' +
          '</div>' +
        '</button>' +
        '<div class="cap-units" id="cap-units-'+mi+'" style="'+(mi===0?'':'display:none')+'">' + unitBtns + '</div>' +
      '</div>';
    }).join('');

  // ── Main panels ───────────────────────────────────────────────────────
  main.innerHTML = CAPACITACIONES.map((mod, mi) => {

    // Checklist
    const clDone = mod.checklist ? mod.checklist.filter((_, idx) => cl[mi+'_'+idx]).length : 0;
    const clHtml = mod.checklist ? ('<div class="cap-checklist-block">' +
      '<div class="cap-checklist-head"><div class="cap-checklist-title">Checklist del m\u00f3dulo</div><div class="cap-checklist-count" id="cap-cl-count-'+mi+'">'+clDone+'/'+mod.checklist.length+'</div></div>' +
      '<div class="cap-checklist-items">' +
        mod.checklist.map((item, idx) => {
          const chk = !!cl[mi+'_'+idx];
          return '<div class="cap-checklist-item'+(chk?' checked':'')+'" id="cap-cl-item-'+mi+'-'+idx+'" onclick="toggleChecklistItem('+mi+','+idx+')">' +
            '<div class="cap-checklist-cb"></div><div class="cap-checklist-text">'+item+'</div></div>';
        }).join('') +
      '</div></div>') : '';

    // Quiz
    const prev    = qr[mi];
    const quizHtml = mod.quiz ? ('<div class="cap-quiz-block">' +
      '<div class="cap-quiz-head" onclick="toggleQuizBlock(this)">' +
          '<div class="cap-quiz-title">'+mod.quiz.title+'</div>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<div class="cap-quiz-badge">'+mod.quiz.questions.length+' preguntas</div>' +
            '<div class="cap-quiz-toggle-icon">▾</div>' +
          '</div>' +
        '</div>' +
      '<div class="cap-quiz-body">' +
        (prev ? '<div class="cap-quiz-prev-result">\u00daltimo intento: <span class="cap-quiz-prev-score">'+prev.score+'/'+prev.total+' correctas</span> \u00b7 '+prev.date+'</div>' : '') +
        mod.quiz.questions.map((q, qi) =>
          '<div class="cap-quiz-question">' +
            '<div class="cap-quiz-q-num">Pregunta '+(qi+1)+'</div>' +
            '<div class="cap-quiz-q-text">'+q.question+'</div>' +
            '<div class="cap-quiz-options">' +
              q.options.map((opt, oi) =>
                '<div class="cap-quiz-option" id="cap-qopt-'+mi+'-'+qi+'-'+oi+'" onclick="selectQuizOption('+mi+','+qi+','+oi+')">' +
                '<div class="cap-quiz-option-dot" id="cap-qdot-'+mi+'-'+qi+'-'+oi+'">'+(oi+1)+'</div>'+opt+'</div>'
              ).join('') +
            '</div>' +
            '<div class="cap-quiz-explanation" id="cap-qexp-'+mi+'-'+qi+'"></div>' +
          '</div>'
        ).join('') +
        '<div class="cap-quiz-footer">' +
          '<div class="cap-quiz-result" id="cap-quiz-result-'+mi+'" style="display:none"></div>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
            '<button class="cap-quiz-btn submit" id="cap-quiz-submit-'+mi+'" onclick="submitQuiz('+mi+')">Finalizar quiz</button>' +
            '<button class="cap-quiz-btn retry"  id="cap-quiz-retry-'+mi+'"  onclick="retryQuiz('+mi+')"  style="display:none">\u21ba Reintentar</button>' +
          '</div>' +
        '</div>' +
      '</div></div>') : '';

    // Units
    const unitsHtml = mod.units.map((unit, ui) => {
      const done = isCapUnitComplete(mi, ui);
      return '<div class="cap-unit-panel '+(ui===0?'active':'')+'" id="cap-unit-panel-'+mi+'-'+ui+'">' +
        '<div class="cap-unit-title"><span class="cap-unit-num">'+mod.num+'.'+(ui+1)+'</span>'+unit.title+'</div>' +
        renderRecursosBlock(unit.recursos) +
        unit.content +
        '<div class="cap-mark-wrap">' +
          '<div class="cap-mark-status'+(done?' done':'')+'" id="cap-mark-status-'+mi+'-'+ui+'">' +
            (done ? '\u2713 Unidad completada' : 'Marcar esta unidad como completada') +
          '</div>' +
          '<button class="cap-mark-btn '+(done?'unmark':'mark')+'" id="cap-mark-btn-'+mi+'-'+ui+'" onclick="markCapUnit('+mi+','+ui+')">' +
            (done ? 'Marcar como pendiente' : 'Marcar como completada') +
          '</button>' +
        '</div>' +
        '<div class="cap-nav-footer">' +
          '<button class="cap-nav-btn" onclick="capNavPrev('+mi+','+ui+')" '+(mi===0&&ui===0?'style="visibility:hidden"':'')+'>\u2190 Anterior</button>' +
          '<span style="font-size:12px;color:#aaa">Unidad '+(ui+1)+' de '+mod.units.length+'</span>' +
          '<button class="cap-nav-btn primary" onclick="capNavNext('+mi+','+ui+')" '+(mi===CAPACITACIONES.length-1&&ui===mod.units.length-1?'style="visibility:hidden"':'')+'>Siguiente \u2192</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return '<div class="cap-panel '+(mi===0?'active':'')+'" id="cap-panel-'+mi+'">' +
      '<div class="cap-mod-header">' +
        '<div class="cap-mod-eyebrow">'+mod.label+'</div>' +
        '<div class="cap-mod-title">'+mod.name+'</div>' +
        '<div class="cap-mod-desc">'+mod.desc+'</div>' +
        '<div class="cap-objetivos">'+mod.objetivos.map(o=>'<span class="cap-objetivo">\u2713 '+o+'</span>').join('')+'</div>' +
      '</div>' +
      unitsHtml + clHtml + quizHtml +
    '</div>';
  }).join('');

  updateOverallProgressUI();
}

function selectCapMod(mi) {
  // Update sidebar buttons
  document.querySelectorAll('.cap-mod-btn').forEach((b,i) => b.classList.toggle('active', i===mi));
  // Show/hide unit lists
  CAPACITACIONES.forEach((_,i) => {
    const el = document.getElementById(`cap-units-${i}`);
    if(el) el.style.display = i===mi ? '' : 'none';
  });
  // Show panel
  document.querySelectorAll('.cap-panel').forEach((p,i) => p.classList.toggle('active', i===mi));
  // Show current unit for this mod
  const ui = currentUnits[mi];
  selectCapUnit(mi, ui, true);
  currentMod = mi;
}


function selectCapUnit(mi, ui, fromMod) {
  currentUnits[mi] = ui;
  // Update unit buttons
  CAPACITACIONES[mi].units.forEach((_,i) => {
    const btn = document.getElementById(`cap-unit-btn-${mi}-${i}`);
    if(btn) btn.classList.toggle('active', i===ui);
  });
  // Show unit panel
  CAPACITACIONES[mi].units.forEach((_,i) => {
    const p = document.getElementById(`cap-unit-panel-${mi}-${i}`);
    if(p) p.classList.toggle('active', i===ui);
  });
  if(!fromMod) selectCapMod_silent(mi);
}


function selectCapMod_silent(mi) {
  if(mi === currentMod) return;
  currentMod = mi;
  document.querySelectorAll('.cap-mod-btn').forEach((b,i) => b.classList.toggle('active', i===mi));
  CAPACITACIONES.forEach((_,i) => {
    const el = document.getElementById(`cap-units-${i}`);
    if(el) el.style.display = i===mi ? '' : 'none';
  });
  document.querySelectorAll('.cap-panel').forEach((p,i) => p.classList.toggle('active', i===mi));
}


function capNavNext(mi, ui) {
  const mod = CAPACITACIONES[mi];
  if (ui < mod.units.length - 1) {
    selectCapUnit(mi, ui + 1);
  } else if (mi < CAPACITACIONES.length - 1) {
    selectCapMod(mi + 1);
  }
  document.getElementById('sec-capacitaciones').scrollIntoView({behavior:'smooth',block:'start'});
}


function capNavPrev(mi, ui) {
  if (ui > 0) {
    selectCapUnit(mi, ui - 1);
  } else if (mi > 0) {
    const prevMod = CAPACITACIONES[mi-1];
    selectCapMod(mi-1);
    selectCapUnit(mi-1, prevMod.units.length-1);
  }
  document.getElementById('sec-capacitaciones').scrollIntoView({behavior:'smooth',block:'start'});
}

function getCapProgressKey() {
  if (!currentUser) return null;
  return 'bp2026_cap_progress_' + (currentUser.id || currentUser.email);
}
function getCapProgress() {
  const key = getCapProgressKey();
  if (!key) return {};
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { return {}; }
}
function saveCapProgress(p) {
  const key = getCapProgressKey(); if (!key) return;
  localStorage.setItem(key, JSON.stringify(p));
}
function isCapUnitComplete(mi, ui) {
  const p = getCapProgress(); return !!(p[mi] && p[mi][ui]);
}
function toggleCapUnitComplete(mi, ui) {
  const p = getCapProgress();
  if (!p[mi]) p[mi] = {};
  p[mi][ui] = !p[mi][ui];
  saveCapProgress(p);
}
function getModuleProgress(mi) {
  const total = CAPACITACIONES[mi].units.length;
  let done = 0;
  for (let ui = 0; ui < total; ui++) { if (isCapUnitComplete(mi, ui)) done++; }
  return { done, total };
}
function getOverallCapProgress() {
  let done = 0, total = 0;
  CAPACITACIONES.forEach((mod, mi) => {
    mod.units.forEach((_, ui) => { total++; if (isCapUnitComplete(mi, ui)) done++; });
  });
  return { done, total, pct: total ? Math.round(done/total*100) : 0 };
}

function getCapChecklistKey() {
  if (!currentUser) return null;
  return 'bp2026_cap_checklist_' + (currentUser.id || currentUser.email);
}
function getCapChecklist() {
  const key = getCapChecklistKey();
  if (!key) return {};
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { return {}; }
}
function saveCapChecklist(cl) {
  const key = getCapChecklistKey(); if (!key) return;
  localStorage.setItem(key, JSON.stringify(cl));
}
function toggleChecklistItem(modIdx, itemIdx) {
  const cl = getCapChecklist();
  const k  = modIdx + '_' + itemIdx;
  cl[k] = !cl[k];
  saveCapChecklist(cl);
  updateChecklistUI(modIdx);
  updateOverallProgressUI();
}

function getCapQuizKey() {
  if (!currentUser) return null;
  return 'bp2026_cap_quiz_' + (currentUser.id || currentUser.email);
}
function getCapQuizResults() {
  const key = getCapQuizKey();
  if (!key) return {};
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) { return {}; }
}
function saveCapQuizResult(modIdx, score, total) {
  const key = getCapQuizKey(); if (!key) return;
  const r = getCapQuizResults();
  r[modIdx] = { score, total, date: new Date().toLocaleDateString() };
  localStorage.setItem(key, JSON.stringify(r));
}

function updateOverallProgressUI() {
  const { done, total, pct } = getOverallCapProgress();
  const wrap  = document.getElementById('cap-overall-progress');
  const fill  = document.getElementById('cap-progress-fill');
  const pctEl = document.getElementById('cap-progress-pct');
  const lblEl = document.getElementById('cap-progress-label');
  if (!wrap) return;
  wrap.style.display = 'flex';
  if (fill)  fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (lblEl) lblEl.textContent = 'Progreso del curso: ' + done + ' de ' + total + ' unidades';
}
function updateSidebarProgress() {
  CAPACITACIONES.forEach((mod, mi) => {
    const prog  = getModuleProgress(mi);
    const progEl = document.getElementById('cap-mod-prog-' + mi);
    if (progEl) progEl.textContent = prog.done + '/' + prog.total + ' completadas';
    mod.units.forEach((_, ui) => {
      const ck = document.getElementById('cap-unit-ck-' + mi + '-' + ui);
      if (!ck) return;
      const done = isCapUnitComplete(mi, ui);
      ck.textContent = done ? '\u2713' : '\u25cb';
      ck.className   = 'cap-unit-check ' + (done ? 'done' : 'todo');
    });
  });
}
function updateMarkButton(mi, ui) {
  const done = isCapUnitComplete(mi, ui);
  const st   = document.getElementById('cap-mark-status-' + mi + '-' + ui);
  const btn  = document.getElementById('cap-mark-btn-' + mi + '-' + ui);
  if (st)  { st.textContent = done ? '\u2713 Unidad completada' : 'Marcar esta unidad como completada'; st.className = 'cap-mark-status' + (done ? ' done' : ''); }
  if (btn) { btn.textContent = done ? 'Marcar como pendiente' : 'Marcar como completada'; btn.className = 'cap-mark-btn ' + (done ? 'unmark' : 'mark'); }
}
function updateChecklistUI(modIdx) {
  const cl  = getCapChecklist();
  const mod = CAPACITACIONES[modIdx];
  if (!mod.checklist) return;
  let done = 0;
  mod.checklist.forEach((_, idx) => {
    const k    = modIdx + '_' + idx;
    const item = document.getElementById('cap-cl-item-' + modIdx + '-' + idx);
    if (item) { if (cl[k]) { item.classList.add('checked'); done++; } else { item.classList.remove('checked'); } }
  });
  const cnt = document.getElementById('cap-cl-count-' + modIdx);
  if (cnt) cnt.textContent = done + '/' + mod.checklist.length;
}
function markCapUnit(mi, ui) {
  toggleCapUnitComplete(mi, ui);
  updateMarkButton(mi, ui);
  updateSidebarProgress();
  updateOverallProgressUI();
}

function selectQuizOption(mi, qi, oi) {
  if (quizSubmitted[mi]) return;
  if (!quizSelections[mi]) quizSelections[mi] = {};
  quizSelections[mi][qi] = oi;
  CAPACITACIONES[mi].quiz.questions.forEach((_, qIdx) => {
    CAPACITACIONES[mi].quiz.questions[qIdx].options.forEach((_, oIdx) => {
      const el = document.getElementById('cap-qopt-' + mi + '-' + qIdx + '-' + oIdx);
      if (el) el.classList.toggle('selected', oIdx === (quizSelections[mi][qIdx] !== undefined ? quizSelections[mi][qIdx] : -1));
    });
  });
}
function submitQuiz(mi) {
  const mod = CAPACITACIONES[mi];
  if (!mod || !mod.quiz) return;
  const qs   = mod.quiz.questions;
  const sels = quizSelections[mi] || {};
  let score  = 0;
  qs.forEach((q, qi) => {
    const sel = sels[qi];
    const ok  = sel === q.correct;
    if (ok) score++;
    q.options.forEach((_, oi) => {
      const el  = document.getElementById('cap-qopt-' + mi + '-' + qi + '-' + oi);
      const dot = document.getElementById('cap-qdot-' + mi + '-' + qi + '-' + oi);
      if (!el) return;
      el.className = 'cap-quiz-option answered';
      if (oi === q.correct)                { el.classList.add('correct'); }
      if (oi === sel && !ok)               { el.classList.add('incorrect'); }
      if (dot) dot.textContent = oi === q.correct ? '\u2713' : (oi === sel && !ok ? '\u2717' : String(oi+1));
    });
    const expEl = document.getElementById('cap-qexp-' + mi + '-' + qi);
    if (expEl) {
      expEl.textContent = (ok ? '\u2713 Correcto. ' : '\u2717 Incorrecto. ') + q.explanation;
      expEl.className   = 'cap-quiz-explanation visible ' + (ok ? 'correct' : 'incorrect');
    }
  });
  quizSubmitted[mi] = true;
  saveCapQuizResult(mi, score, qs.length);
  const resEl = document.getElementById('cap-quiz-result-' + mi);
  if (resEl) { resEl.innerHTML = 'Resultado: <span class="score">' + score + '/' + qs.length + ' correctas</span>'; resEl.style.display = 'block'; }
  const sub = document.getElementById('cap-quiz-submit-' + mi);
  const ret = document.getElementById('cap-quiz-retry-' + mi);
  if (sub) sub.style.display = 'none';
  if (ret) ret.style.display = '';
}
function retryQuiz(mi) {
  quizSelections[mi] = {};
  quizSubmitted[mi]  = false;
  const mod = CAPACITACIONES[mi];
  if (!mod || !mod.quiz) return;
  mod.quiz.questions.forEach((q, qi) => {
    q.options.forEach((_, oi) => {
      const el  = document.getElementById('cap-qopt-' + mi + '-' + qi + '-' + oi);
      const dot = document.getElementById('cap-qdot-' + mi + '-' + qi + '-' + oi);
      if (el)  el.className = 'cap-quiz-option';
      if (dot) dot.textContent = String(oi+1);
    });
    const expEl = document.getElementById('cap-qexp-' + mi + '-' + qi);
    if (expEl) expEl.className = 'cap-quiz-explanation';
  });
  const resEl = document.getElementById('cap-quiz-result-' + mi);
  if (resEl) resEl.style.display = 'none';
  const sub = document.getElementById('cap-quiz-submit-' + mi);
  const ret = document.getElementById('cap-quiz-retry-' + mi);
  if (sub) sub.style.display = '';
  if (ret) ret.style.display = 'none';
}



/* ── Quiz block toggle ── */
function toggleQuizBlock(headEl) {
  const block = headEl.closest('.cap-quiz-block');
  if (block) block.classList.toggle('open');
}

function renderGuia() {
  const nav = document.getElementById('guia-nav');
  const panels = document.getElementById('guia-panels');
  if (!nav || !panels) return;

  nav.innerHTML = GUIA_STEPS.map((s, i) => `
    <div class="guia-nav-step">
      <button class="guia-nav-btn ${i===0?'active':''}" onclick="goGuiaStep(${i})">
        <div class="gnav-num">${s.num}</div>
        <div class="gnav-label">${s.nav}</div>
      </button>
      ${i < GUIA_STEPS.length-1 ? '<span class="guia-nav-arrow">›</span>' : ''}
    </div>
  `).join('');

  panels.innerHTML = GUIA_STEPS.map((s, i) => `
    <div class="guia-step-panel ${i===0?'active':''}" id="guia-panel-${i}">
      <div class="step-header">
        <div class="step-num-big">${s.num}</div>
        <div class="step-header-text">
          <div class="step-eyebrow">Paso ${s.num} de ${GUIA_STEPS.length}</div>
          <div class="step-title">${s.title}</div>
          <div class="step-subtitle">${s.subtitle}</div>
        </div>
      </div>
      ${s.content}
      <div class="step-footer">
        <button class="step-btn" onclick="goGuiaStep(${i-1})" ${i===0?'style="visibility:hidden"':''}>← Anterior</button>
        <span class="step-progress">${s.num} / ${GUIA_STEPS.length}</span>
        <button class="step-btn primary" onclick="goGuiaStep(${i+1})" ${i===GUIA_STEPS.length-1?'style="visibility:hidden"':''}>Siguiente →</button>
      </div>
    </div>
  `).join('');
}

function goGuiaStep(idx) {
  if (idx < 0 || idx >= GUIA_STEPS.length) return;
  document.querySelectorAll('.guia-step-panel').forEach((p,i) => p.classList.toggle('active', i===idx));
  document.querySelectorAll('.guia-nav-btn').forEach((b,i) => b.classList.toggle('active', i===idx));
  document.getElementById('sec-guia').scrollIntoView({behavior:'smooth', block:'start'});
}

renderGuia();
