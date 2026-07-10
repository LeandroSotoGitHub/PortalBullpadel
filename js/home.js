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
