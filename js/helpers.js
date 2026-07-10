// -- HELPERS . utilitarios compartidos entre modulos -----------------------
// estiloClass/nivelClass: usados por catalogo Y comparador.
// normalizarTexto/hayPalabra: usados por recomendador Y mapa competitivo.
function estiloClass(e){
  if(!e)return 'polivalente';
  const l=e.toLowerCase();
  if(l.includes('ofen'))return 'ofensivo';
  if(l.includes('defen'))return 'defensivo';
  if(l.includes('confort'))return 'confort';
  return 'polivalente';
}
function nivelClass(n){
  if(!n)return 'nivel-ama';
  const l=n.toLowerCase();
  if(l.includes('prof'))return 'nivel-pro';
  if(l.includes('avanz'))return 'nivel-avz';
  if(l.includes('inter'))return 'nivel-ini';
  if(l.includes('amac')||l.includes('amateur'))return 'nivel-ama';
  if(l.includes('inicia'))return 'nivel-ini';
  if(l.includes('junior'))return 'nivel-jun';
  return 'nivel-ama';
}

/* ── Normalize string: lowercase + remove accents for fuzzy search ── */
function normalizeStr(str) {
  if (!str) return '';
  return String(str).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* ── Build searchable haystack for a pala ── */
function palHaystack(p) {
  const matNames = (p.materiales || []).map(cod => {
    const m = MATERIALES.find(m => m.cod === cod || m.id === cod);
    return m ? m.nombre : cod;
  });
  return normalizeStr([
    p.nombre, p.linea, p.nivel, p.estilo, p.forma,
    p.exterior, p.interior, p.jugador || '',
    p.perfilJugador || '', p.sensacionJuego || '',
    p.argumentoVenta || '',
    ...(p.tecnologias || []),
    ...matNames,
  ].join(' '));
}

function normalizarTexto(t) {
  if (!t) return '';
  return String(t).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ');
}

function hayPalabra(texto, palabras) {
  const n = normalizarTexto(texto);
  return palabras.some(p => n.includes(p));
}

/* ── Score ─────────────────────────────────────────────────────────────── */
