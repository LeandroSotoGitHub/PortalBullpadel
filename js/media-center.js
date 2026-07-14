// -- MEDIA CENTER . índice de acceso a material de Drive -------------------
// Puramente navegación: cada card abre una carpeta de Google Drive en una
// pestaña nueva. El portal no aloja ni sirve ninguno de esos archivos.

function renderMediaCenter() {
  const el = document.getElementById('media-center-shelves');
  if (!el || typeof MEDIA_CENTER === 'undefined') return;

  el.innerHTML = Object.keys(MEDIA_CENTER).map(catNombre => {
    const cat = MEDIA_CENTER[catNombre];

    const cardsHtml = cat.subcarpetas.map(sub => `
      <a class="media-card" href="${sub.url}" target="_blank" rel="noopener noreferrer">
        <div class="media-card-icon">↗</div>
        <div class="media-card-name">${sub.nombre}</div>
      </a>
    `).join('');

    return `
      <div class="media-shelf">
        <div class="media-shelf-head">
          <div class="media-shelf-title">${catNombre}</div>
          <a class="media-shelf-link" href="${cat.url}" target="_blank" rel="noopener noreferrer">
            Abrir carpeta completa ↗
          </a>
        </div>
        <div class="media-grid">${cardsHtml}</div>
      </div>
    `;
  }).join('');
}
