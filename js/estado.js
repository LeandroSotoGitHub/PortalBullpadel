// -- ESTADO GLOBAL . variables mutables compartidas entre modulos ---------
// Centralizado aca (antes estaban declaradas dispersas en varios puntos del
// archivo unico); los valores iniciales y el comportamiento no cambian.
let currentMod = 0;
let currentUnits = [0,0,0,0];
let currentUser = null; // objeto usuario logueado
let _currentPalaId = null;
let quizSelections = {};
let quizSubmitted  = {};
let recAnswers = { 0: 'indistinto' }; // Q0 defaults to indistinto
let _recResultIds = []; // tracks current recommendation ids

// Context passed from recomendador to comparador
let compareContext = null;
let _isProgrammaticCompare = false; // prevents select onChange from clearing context
let _obStep = 0;
let _mapaSelectedId = null;

// -- LIMPIEZA DE ESTADO ENTRE SESIONES ------------------------------------
// Si dos cuentas distintas inician sesión en la misma pestaña, ningún
// resultado/selección/progreso de la cuenta anterior debe quedar visible ni
// reutilizarse (recomendador, comparador, mapa competitivo, capacitaciones).
// Llamada desde _resetPortalUI() en js/auth.js al hacer logout. No toca
// dataset.mounted de las subvistas de catálogo/guía — esas siguen montadas
// una sola vez por diseño y no dependen del usuario.
function clearPreviousSessionState() {
  // Recomendador — respuestas, resultados guardados y su render
  recAnswers = { 0: 'indistinto' };
  _recResultIds = [];
  document.querySelectorAll('.rec-option').forEach(o => o.classList.remove('selected'));
  const recDefaultOpt = document.querySelector('#rec-q0 .rec-option');
  if (recDefaultOpt) recDefaultOpt.classList.add('selected');
  const recResultsEl = document.getElementById('rec-results');
  if (recResultsEl) recResultsEl.innerHTML = '';

  // Comparador Bullpadel — contexto, selects y resultado
  compareContext = null;
  _isProgrammaticCompare = false;
  ['c1', 'c2', 'c3'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.value = '';
  });
  const compResultEl = document.getElementById('comp-result');
  if (compResultEl) compResultEl.innerHTML = '';

  // Mapa competitivo — selección y resultado
  _mapaSelectedId = null;
  const mapaMarcaEl = document.getElementById('mapa-marca');
  if (mapaMarcaEl) mapaMarcaEl.value = '';
  const mapaModeloEl = document.getElementById('mapa-modelo');
  if (mapaModeloEl) {
    mapaModeloEl.innerHTML = '<option value="">— elegir modelo —</option>';
    delete mapaModeloEl.dataset.populated; // fuerza repoblar en la próxima visita a la tab
  }
  const mapaResultEl = document.getElementById('mapa-result');
  if (mapaResultEl) mapaResultEl.innerHTML = '';

  // Capacitaciones — navegación y estado de quiz en memoria (no persistido).
  // El progreso/checklist/quiz guardado en localStorage ya está namespaced
  // por userId (ver js/capacitaciones.js); acá se limpia solo el estado
  // transitorio en memoria que no lo está y bloquearía a la cuenta nueva
  // (ej. quizSubmitted impidiendo responder un quiz ya resuelto por otra
  // cuenta en el mismo módulo).
  currentMod = 0;
  currentUnits = [0, 0, 0, 0];
  quizSelections = {};
  quizSubmitted = {};

  // Tips contextuales por módulo — banners insertados en el DOM del módulo
  document.querySelectorAll('.module-tip').forEach(el => el.remove());
}
