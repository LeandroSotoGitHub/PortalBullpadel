// -- ONBOARDING . OB_STEPS vive aca (dato usado solo por este modulo) ----

const OB_STEPS = [
  {
    icon: 'BP',
    title: 'Bienvenido al Portal Bullpadel 2026',
    text: 'Esta es tu herramienta de consulta, capacitación y recomendación para vender mejor la gama Bullpadel.',
    illustration:
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="32" cy="25" rx="18" ry="19" fill="#fff" stroke="var(--rojo)" stroke-width="3"/>' +
        '<circle cx="24" cy="18" r="1.6" fill="var(--rojo)"/><circle cx="32" cy="15" r="1.6" fill="var(--rojo)"/><circle cx="40" cy="18" r="1.6" fill="var(--rojo)"/>' +
        '<circle cx="19" cy="25" r="1.6" fill="var(--rojo)"/><circle cx="32" cy="25" r="1.6" fill="var(--rojo)"/><circle cx="45" cy="25" r="1.6" fill="var(--rojo)"/>' +
        '<circle cx="24" cy="32" r="1.6" fill="var(--rojo)"/><circle cx="32" cy="35" r="1.6" fill="var(--rojo)"/><circle cx="40" cy="32" r="1.6" fill="var(--rojo)"/>' +
        '<rect x="29" y="41" width="6" height="17" rx="3" fill="var(--negro)"/>' +
      '</svg>'
  },
  {
    icon: 'RUTA',
    title: 'Un flujo pensado para vender mejor',
    text: 'Capacitáte, consultá el catálogo, usá el recomendador, compará opciones y abrí la ficha técnica para cerrar con un argumento claro.',
    illustration:
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
        '<line x1="10" y1="32" x2="54" y2="32" stroke="var(--gris-borde)" stroke-width="3"/>' +
        '<circle cx="13" cy="32" r="6" fill="var(--negro)"/>' +
        '<circle cx="32" cy="32" r="6" fill="var(--rojo)"/>' +
        '<circle cx="51" cy="32" r="6" fill="var(--negro)"/>' +
        '<path d="M54 26 L61 32 L54 38" stroke="var(--rojo)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
  },
  {
    icon: 'CAT',
    title: 'Conocé el producto con criterio',
    text: 'En el Catálogo podés consultar fichas técnicas, líneas, formas, balances y perfiles de jugador. En Materiales y tecnologías encontrás explicaciones simples para traducir cada dato técnico en un beneficio de venta.',
    illustration:
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="9" y="7" width="46" height="50" rx="6" fill="#fff" stroke="var(--gris-borde)" stroke-width="2"/>' +
        '<rect x="15" y="14" width="17" height="17" rx="3" fill="var(--rojo-soft)"/>' +
        '<rect x="36" y="16" width="13" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="36" y="23" width="13" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="15" y="37" width="34" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="15" y="44" width="34" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="15" y="51" width="20" height="3" rx="1.5" fill="var(--rojo)"/>' +
      '</svg>'
  },
  {
    icon: 'REC',
    title: 'Recomendá con más criterio',
    text: 'Cuando un cliente no sabe qué pala elegir, usá el Recomendador. Respondés 6 preguntas, el sistema rankea las palas y después podés comparar las 3 recomendaciones.',
    illustration:
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="9" y="9" width="46" height="46" rx="8" fill="#fff" stroke="var(--gris-borde)" stroke-width="2"/>' +
        '<rect x="33" y="14" width="17" height="9" rx="4.5" fill="var(--rojo)"/>' +
        '<rect x="15" y="29" width="34" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="15" y="36" width="24" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="15" y="45" width="34" height="10" rx="5" fill="var(--negro)"/>' +
      '</svg>'
  },
  {
    icon: 'CAP',
    title: 'Formación comercial',
    text: 'En Capacitaciones encontrás videos, infografías, checklist y quiz. Tu progreso queda guardado automáticamente. Podés volver a ver esta bienvenida desde Inicio cuando quieras.',
    illustration:
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="9" y="11" width="11" height="11" rx="3" fill="var(--rojo)"/>' +
        '<path d="M12 16.5l2.2 2.2 3.8-4.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<rect x="27" y="14.5" width="28" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="9" y="27" width="11" height="11" rx="3" fill="var(--rojo)"/>' +
        '<path d="M12 32.5l2.2 2.2 3.8-4.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<rect x="27" y="30.5" width="28" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
        '<rect x="9" y="43" width="11" height="11" rx="3" fill="none" stroke="var(--gris-borde)" stroke-width="2"/>' +
        '<rect x="27" y="46.5" width="20" height="3" rx="1.5" fill="var(--gris-borde)"/>' +
      '</svg>'
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

// navigateByRole: solo el botón final del paso 5 lo pasa en true (Omitir/Escape/click afuera cierran sin redirigir)
function closeOnboarding(saveSeen, navigateByRole) {
  if (saveSeen !== false) markOnboardingSeen();
  document.getElementById('ob-bg').classList.remove('open');
  document.body.style.overflow = '';
  if (navigateByRole) navigateOnboardingClose();
}

// Cierre del modal dirigido por rol — usuario->Recomendador, vendedor->Comparador, owner->sin redirección forzada
function navigateOnboardingClose() {
  if (!currentUser) return;
  const destByRole = { usuario: 'recomendador', vendedor: 'comparador' };
  const dest = destByRole[currentUser.rol];
  if (dest) showSection(dest, null);
}

function nextOnboardingStep() {
  if (_obStep < OB_STEPS.length - 1) {
    _obStep++;
    renderOnboardingStep();
  } else {
    closeOnboarding(true, true);
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
  document.getElementById('ob-icon').innerHTML = step.illustration || '';
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

// -- TIPS CONTEXTUALES POR MÓDULO — capa independiente del modal de 5 pasos --
// Se disparan la primera vez que el usuario entra a cada módulo (hook llamado desde showSection en eventos.js).
// Media Center y Administración quedan afuera a propósito (no están en este mapa).
const MODULE_TIPS = {
  catalogo: 'Buscá una pala por nombre, línea o nivel, o mirá Materiales y tecnologías para explicar cada dato técnico en criollo.',
  recomendador: 'Elegí las 6 preguntas y te mostramos las 3 palas más indicadas para tu cliente.',
  comparador: 'Elegí hasta 3 palas y compará diferencias clave, resumen ejecutivo y cómo explicar cada opción.',
  capacitaciones: 'Mirá los videos, completá el checklist y el quiz de cada módulo — tu progreso se guarda solo.'
};

function getModuleTipKey(moduleId) {
  if (!currentUser) return null;
  return 'bp2026_onboarding_tip_' + moduleId + '_' + (currentUser.id || currentUser.email);
}

function maybeShowModuleTip(moduleId) {
  const text = MODULE_TIPS[moduleId];
  if (!text || !currentUser) return;
  const key = getModuleTipKey(moduleId);
  if (!key || localStorage.getItem(key) === 'seen') return;
  renderModuleTip(moduleId, text);
}

function renderModuleTip(moduleId, text) {
  const host = document.getElementById('sec-' + moduleId);
  if (!host || host.querySelector('.module-tip')) return;

  const tip = document.createElement('div');
  tip.className = 'module-tip';
  tip.innerHTML =
    '<span class="module-tip-text"></span>' +
    '<button class="module-tip-close" type="button" aria-label="Cerrar aviso">✕</button>';
  tip.querySelector('.module-tip-text').textContent = text;
  tip.querySelector('.module-tip-close').addEventListener('click', function() {
    dismissModuleTip(moduleId, tip);
  });

  const head = host.querySelector('.sec-head');
  if (head) head.insertAdjacentElement('afterend', tip);
  else host.insertBefore(tip, host.firstChild);
}

function dismissModuleTip(moduleId, tipEl) {
  const key = getModuleTipKey(moduleId);
  if (key) localStorage.setItem(key, 'seen');
  if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl);
}
