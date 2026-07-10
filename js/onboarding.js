// -- ONBOARDING . OB_STEPS vive aca (dato usado solo por este modulo) ----

const OB_STEPS = [
  {
    icon: 'BP',
    title: 'Bienvenido al Portal Bullpadel 2026',
    text: 'Esta es tu herramienta de consulta, capacitaci\u00f3n y recomendaci\u00f3n para vender mejor la gama Bullpadel.'
  },
  {
    icon: 'RUTA',
    title: 'Un flujo pensado para vender mejor',
    text: 'Capacit\u00e1te, consult\u00e1 el cat\u00e1logo, us\u00e1 el recomendador, compar\u00e1 opciones y abr\u00ed la ficha t\u00e9cnica para cerrar con un argumento claro.'
  },
  {
    icon: 'CAT',
    title: 'Conoc\u00e9 el producto con criterio',
    text: 'En el Cat\u00e1logo pod\u00e9s consultar fichas t\u00e9cnicas, l\u00edneas, formas, balances y perfiles de jugador. En Materiales y tecnolog\u00edas encontr\u00e1s explicaciones simples para traducir cada dato t\u00e9cnico en un beneficio de venta.'
  },
  {
    icon: 'REC',
    title: 'Recomend\u00e1 con m\u00e1s criterio',
    text: 'Cuando un cliente no sabe qu\u00e9 pala elegir, us\u00e1 el Recomendador. Respond\u00e9s 5 preguntas, el sistema rankea las palas y despu\u00e9s pod\u00e9s comparar las 3 recomendaciones.'
  },
  {
    icon: 'CAP',
    title: 'Formaci\u00f3n comercial',
    text: 'En Capacitaciones encontr\u00e1s videos, infograf\u00edas, checklist y quiz. Tu progreso queda guardado autom\u00e1ticamente. Pod\u00e9s volver a ver esta bienvenida desde Inicio cuando quieras.'
  }
];

function getOnboardingKey() {
  if (!currentUser) return null;
  return 'bp2026_onboarding_' + (currentUser.id || currentUser.email);
}

function hasSeenOnboarding() {
  const key = getOnboardingKey();
  if (!key) return true; // no user = don't show
  return localStorage.getItem(key) === 'seen';
}

function markOnboardingSeen() {
  const key = getOnboardingKey();
  if (key) localStorage.setItem(key, 'seen');
}

function openOnboarding() {
  _obStep = 0;
  renderOnboardingStep();
  document.getElementById('ob-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOnboarding(saveSeen) {
  if (saveSeen !== false) markOnboardingSeen();
  document.getElementById('ob-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function nextOnboardingStep() {
  if (_obStep < OB_STEPS.length - 1) {
    _obStep++;
    renderOnboardingStep();
  } else {
    closeOnboarding(true);
  }
}

function prevOnboardingStep() {
  if (_obStep > 0) {
    _obStep--;
    renderOnboardingStep();
  }
}

function renderOnboardingStep() {
  const step  = OB_STEPS[_obStep];
  const total = OB_STEPS.length;
  const isLast = _obStep === total - 1;
  const isFirst = _obStep === 0;

  document.getElementById('ob-step-label').textContent =
    'Paso ' + (_obStep + 1) + ' de ' + total;
  document.getElementById('ob-title').textContent = step.title;
  document.getElementById('ob-icon').textContent  = step.icon;
  document.getElementById('ob-text').textContent  = step.text;

  // Dots
  document.getElementById('ob-dots').innerHTML = OB_STEPS.map((_, i) =>
    '<div class="ob-dot' + (i === _obStep ? ' active' : '') + '"></div>'
  ).join('');

  // Buttons
  const prevBtn = document.getElementById('ob-prev');
  const nextBtn = document.getElementById('ob-next');
  prevBtn.style.visibility = isFirst ? 'hidden' : 'visible';
  nextBtn.textContent = isLast ? 'Empezar a usar el portal' : 'Siguiente';
}

// Escape key closes onboarding
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const bg = document.getElementById('ob-bg');
    if (bg && bg.classList.contains('open')) closeOnboarding(true);
  }
});
