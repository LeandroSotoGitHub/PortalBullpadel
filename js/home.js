function renderHomeQuickAccess() {
  const el = document.getElementById('home-cards');
  if (!el || !currentUser) return;

  const puedeVerMapa = ROLES[currentUser.rol]?.permisos?.verCompetencia !== false;
  const esVendedor = currentUser.rol === 'vendedor';

  const cardDefs = {
    recomendador: {
      icon: 'REC', title: 'Recomendador Bullpadel',
      desc: 'Respondé algunas preguntas y encontrá las palas más adecuadas según nivel, estilo y necesidad del jugador.',
      cta: 'Usar recomendador', action: "showSection('recomendador',null)",
    },
    capacitaciones: {
      icon: 'CAP', title: 'Capacitaciones',
      desc: 'Formación comercial con videos, infografías, checklist, progreso y quiz por módulo.',
      cta: 'Ver capacitaciones', action: "showSection('capacitaciones',null)",
    },
    catalogo: {
      icon: 'CAT', title: 'Catálogo de palas',
      desc: 'Consultá fichas técnicas, materiales, tecnologías, sensación de juego y perfil recomendado.',
      cta: 'Ver catálogo', action: "showSection('palas',null)",
    },
    comparador: {
      icon: 'VS',
      title: (esVendedor && puedeVerMapa) ? 'Comparador + Mapa competitivo' : 'Comparador',
      desc: (esVendedor && puedeVerMapa)
        ? 'Compará hasta 3 palas y consultá el mapa competitivo para responder objeciones.'
        : 'Compará hasta 3 palas lado a lado para entender diferencias clave entre modelos.',
      cta: 'Ir al comparador', action: "showSection('comparador',null)",
    },
  };

  const order = esVendedor
    ? ['comparador', 'catalogo', 'recomendador', 'capacitaciones']
    : ['recomendador', 'capacitaciones', 'catalogo', 'comparador'];

  el.innerHTML = order.map((id, i) => {
    const big = i < 2;
    const d = cardDefs[id];
    return `
      <div class="home-card ${big ? 'big' : ''}" onclick="${d.action}">
        <div class="home-card-icon">${d.icon}</div>
        <div class="home-card-name">${d.title}</div>
        <div class="home-card-desc">${d.desc}</div>
        <button class="home-card-btn" onclick="event.stopPropagation();${d.action}">${d.cta}</button>
      </div>
    `;
  }).join('');
}

function renderHomeStats() {
  const el = document.getElementById('home-stats');
  if (!el) return;

  const numPalas   = PALAS.length;
  const numLineas  = new Set(PALAS.map(p => p.linea).filter(Boolean)).size;
  const numItems   = (typeof ITEMS !== 'undefined') ? ITEMS.length : 0;
  const numModulos = (typeof CAPACITACIONES !== 'undefined') ? CAPACITACIONES.length : 0;

  const stats = [
    { num: numPalas,   label: 'Palas en catálogo' },
    { num: numLineas,  label: 'Líneas de producto' },
    { num: numItems,   label: 'Mat. y tecnologías' },
    { num: numModulos, label: 'Módulos de capacitación' },
  ];

  el.innerHTML = stats.map(s =>
    '<div class="home-stat">' +
      '<div class="home-stat-num">' + s.num + '</div>' +
      '<div class="home-stat-label">' + s.label + '</div>' +
    '</div>'
  ).join('');
}
