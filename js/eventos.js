function toggleMobileNav() {
  var nav = document.getElementById('nav-bar');
  if (nav) nav.classList.toggle('open');
}

function showCatalogoTab(tab, btn) {
  // Update subnav buttons
  document.querySelectorAll('#subnav-catalogo .subnav-btn')
    .forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const target = [...document.querySelectorAll('#subnav-catalogo .subnav-btn')]
      .find(b => b.textContent.trim().toLowerCase().includes(tab === 'palas' ? 'pala' : tab === 'tabla' ? 'gama' : 'material'));
    if (target) target.classList.add('active');
  }
  // Show subview
  document.querySelectorAll('#sec-catalogo .subview')
    .forEach(v => v.classList.remove('active'));
  const sv = document.getElementById('catalogo-tab-' + tab);
  if (sv) sv.classList.add('active');

  // Lazy-mount content: move section content into subview if not yet mounted
  _mountCatalogoTab(tab);
}


function _mountCatalogoTab(tab) {
  const subview = document.getElementById('catalogo-tab-' + tab);
  if (!subview || subview.dataset.mounted) return;

  const srcMap = { palas: 'sec-palas', tabla: 'sec-tabla', glosario: 'sec-glosario' };
  const srcId  = srcMap[tab];
  const src    = document.getElementById(srcId);
  if (!src) { subview.dataset.mounted = '1'; return; }

  // Move all children (not the section itself — keep it in DOM for compat)
  // Clone and append content; mark original as hidden proxy
  subview.innerHTML = '';
  // Move children
  while (src.firstChild) subview.appendChild(src.firstChild);
  src.style.display = 'none';
  src.dataset.proxy = 'catalogo-tab-' + tab;
  subview.dataset.mounted = '1';
}

/* Show a tab inside Capacitaciones */

function showCapTab(tab, btn) {
  document.querySelectorAll('#subnav-cap .subnav-btn')
    .forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const target = [...document.querySelectorAll('#subnav-cap .subnav-btn')]
      .find(b => b.textContent.trim().toLowerCase().includes(tab === 'modulos' ? 'módulo' : 'guía'));
    if (target) target.classList.add('active');
  }
  document.querySelectorAll('#sec-capacitaciones .subview')
    .forEach(v => v.classList.remove('active'));
  const sv = document.getElementById('cap-tab-' + tab);
  if (sv) sv.classList.add('active');

  if (tab === 'guia') _mountGuiaTab();
}


function _mountGuiaTab() {
  const subview = document.getElementById('cap-tab-guia');
  if (!subview || subview.dataset.mounted) return;

  const src = document.getElementById('sec-guia');
  if (!src) { subview.dataset.mounted = '1'; return; }
  subview.innerHTML = '';
  while (src.firstChild) subview.appendChild(src.firstChild);
  src.style.display = 'none';
  src.dataset.proxy = 'cap-tab-guia';
  subview.dataset.mounted = '1';
}

/* Navigate directly to a subsection — used from Home cards */

function showSectionTab(section, tab) {
  showSection(section, null);
  if (section === 'catalogo') showCatalogoTab(tab, null);
  if (section === 'capacitaciones') showCapTab(tab, null);
}


function showSection(id,btn){
  var nav2 = document.getElementById('nav-bar');
  if (nav2) nav2.classList.remove('open');

  // Legacy redirects: old section IDs → new module parents
  var legacyMap = { 'palas':'catalogo', 'glosario':'catalogo', 'tabla':'catalogo', 'guia':'capacitaciones' };
  var legacyTab = { 'palas':'palas', 'glosario':'glosario', 'tabla':'tabla', 'guia':'guia' };
  if (legacyMap[id]) {
    var parentId = legacyMap[id];
    var tabId    = legacyTab[id];
    showSection(parentId, null);
    if (parentId === 'catalogo')       showCatalogoTab(tabId, null);
    if (parentId === 'capacitaciones') showCapTab(tabId === 'guia' ? 'guia' : 'modulos', null);
    return;
  }

  // Allow btn to be null (called from home cards)
  if (!btn) {
    var sectionMap = { 'inicio':'Inicio','catalogo':'Catálogo','comparador':'Comparador',
      'capacitaciones':'Capacitaciones','recomendador':'Recomendador','admin':'Administración',
      'media-center':'Media Center' };
    btn = [...document.querySelectorAll('.nav-btn')]
      .find(b => b.textContent.trim() === (sectionMap[id] || '')) || null;
  }
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('visible'));
  document.getElementById('sec-'+id).classList.add('visible');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

function openLightbox(src, alt) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-img').alt = alt;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLightbox(); });

/* ── Admin UI wiring + onboarding click-outside ── */
document.addEventListener('DOMContentLoaded', () => {
  const cuRol = document.getElementById('cu-rol');
  if (cuRol) cuRol.addEventListener('change', adminUpdateMayoristaHint);
  // Onboarding: click outside modal closes it
  const obBg = document.getElementById('ob-bg');
  if (obBg) obBg.addEventListener('click', function(e) {
    if (e.target === this) closeOnboarding(true);
  });
});
