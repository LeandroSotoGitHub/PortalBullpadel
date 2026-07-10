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
