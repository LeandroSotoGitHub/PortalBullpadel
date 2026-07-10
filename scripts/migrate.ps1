# One-off migration script — splits index.html into css/ + js/ modules.
# Not part of the shipped portal; safe to delete after the migration is verified.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src = Get-Content -Path (Join-Path $root 'index.html') -Encoding UTF8

function Lines($start, $end) {
  # inclusive, 1-indexed
  return ($src[($start - 1)..($end - 1)] -join "`n")
}

function WriteFile($relPath, [string[]]$parts, [string]$sep = "`n`n") {
  $full = Join-Path $root $relPath
  $content = ($parts -join $sep) + "`n"
  [System.IO.File]::WriteAllText($full, $content, (New-Object System.Text.UTF8Encoding($false)))
}

# ---------- CSS ----------
WriteFile 'css/styles.css' @((Lines 9 2863)) "`n"

# ---------- DATA.JS ----------
$dataHeader = @'
// -- DATA . modelos de datos del portal Bullpadel 2026 --------------------
// Imagenes: ya no se embeben en base64. Se referencian por ruta relativa
// (ver img/palas/ e img/materiales/), con un pequeno helper de resolucion
// para no romper el caso "Custom Weight" (cod !== id, sin archivo extraido
// hoy, igual que en el IMGS/ITEM_IMGS original: se oculta, no rompe).
function palaImgSrc(id) { return `img/palas/${id}.jpg`; }
const ITEM_IMG_MISSING = new Set(['CustomWeight']);
function itemImgSrc(cod) { return ITEM_IMG_MISSING.has(cod) ? '' : `img/materiales/${cod}.png`; }
'@
$dataParts = @(
  $dataHeader,
  (Lines 3767 4322),  # PALAS
  (Lines 4323 4411),  # MATERIALES
  (Lines 4412 4536),  # TECNOLOGIAS
  (Lines 4537 4579),  # JUGADORES
  (Lines 4580 4617),  # USUARIOS
  (Lines 4618 4744),  # ROLES
  (Lines 4745 4781),  # COMPETENCIA
  (Lines 4782 4835),  # CONFIG
  (Lines 4836 4851),  # ITEMS
  (Lines 4852 5157),  # GUIA_STEPS
  (Lines 5205 5559),  # CAPACITACIONES
  "`n// -- PALAS_COMPETENCIA (RUN 15B) -- movido aqui sin cambios ------------",
  (Lines 9068 9531)   # PALAS_COMPETENCIA (incluye el "];" de cierre)
)
WriteFile 'js/data.js' $dataParts

# ---------- ESTADO.JS ----------
$estadoHeader = @'
// -- ESTADO GLOBAL . variables mutables compartidas entre modulos ---------
// Centralizado aca (antes estaban declaradas dispersas en varios puntos del
// archivo unico); los valores iniciales y el comportamiento no cambian.
'@
$estadoParts = @(
  $estadoHeader,
  (Lines 5566 5567),  # currentMod, currentUnits
  (Lines 5900 5900),  # currentUser
  (Lines 6905 6905),  # _currentPalaId
  (Lines 7241 7242),  # quizSelections, quizSubmitted
  (Lines 7325 7330),  # recAnswers, _recResultIds, compareContext, _isProgrammaticCompare
  (Lines 7931 7931),  # _obStep
  (Lines 8026 8026)   # _mapaSelectedId
)
WriteFile 'js/estado.js' $estadoParts "`n"

# ---------- HELPERS.JS ----------
$helpersHeader = @'
// -- HELPERS . utilitarios compartidos entre modulos -----------------------
// estiloClass/nivelClass: usados por catalogo Y comparador.
// normalizarTexto/hayPalabra: usados por recomendador Y mapa competitivo.
'@
$helpersParts = @(
  $helpersHeader,
  (Lines 6110 6117),  # estiloClass
  (Lines 6118 6128),  # nivelClass
  (Lines 6137 6158),  # normalizeStr + palHaystack (usadas hoy solo por catalogo.js, centralizadas aca igual)
  (Lines 7339 7345),  # normalizarTexto
  (Lines 7346 7351)   # hayPalabra
)
WriteFile 'js/helpers.js' $helpersParts "`n"

# ---------- AUTH.JS ----------
$authParts = @(
  (Lines 5874 5899),  # USERS_KEY, getUsers, saveUsers, seedUsers
  (Lines 5903 6103)   # saveSession..initAuth (SESSION_KEY, mountPortal, applyRolePermissions)
)
WriteFile 'js/auth.js' $authParts

# ---------- CATALOGO.JS ----------
$catalogoParts = @(
  (Lines 6160 6258), (Lines 6259 6267), (Lines 6268 6320),
  (Lines 6624 6654), (Lines 6655 6670), (Lines 6671 6681), (Lines 6682 6692),
  (Lines 6693 6731), (Lines 6732 6789), (Lines 6790 6798),
  (Lines 6801 6876), (Lines 6877 6881), (Lines 6882 6896),
  (Lines 6908 6918), (Lines 6919 6933), (Lines 6934 7039),
  (Lines 7040 7045), (Lines 7046 7050), (Lines 7051 7056),
  (Lines 7057 7092), (Lines 7093 7106)
)
WriteFile 'js/catalogo.js' $catalogoParts

# ---------- RECOMENDADOR.JS ----------
$recomendadorParts = @(
  (Lines 7332 7338), (Lines 7352 7523), (Lines 7524 7535), (Lines 7536 7621),
  (Lines 7622 7627), (Lines 7628 7646), (Lines 7647 7666), (Lines 7667 7704),
  (Lines 7705 7725), (Lines 7726 7793), (Lines 7794 7838), (Lines 7839 7842),
  (Lines 7843 7858), (Lines 7859 7872)
)
WriteFile 'js/recomendador.js' $recomendadorParts

# ---------- COMPARADOR.JS ----------
$comparadorParts = @(
  (Lines 6321 6328), (Lines 6329 6336), (Lines 6337 6341), (Lines 6342 6350),
  (Lines 6351 6356), (Lines 6359 6427), (Lines 6428 6477), (Lines 6478 6488),
  (Lines 6489 6516), (Lines 6517 6623), (Lines 8014 8019)
)
WriteFile 'js/comparador.js' $comparadorParts

# ---------- MAPA-COMPETITIVO.JS ----------
$mapaParts = @(
  (Lines 8029 8055), (Lines 8056 8062), (Lines 8063 8074), (Lines 8075 8088),
  (Lines 8089 8094), (Lines 8095 8170), (Lines 8171 8202), (Lines 8203 8211),
  (Lines 8212 8224), (Lines 8225 8345)
)
WriteFile 'js/mapa-competitivo.js' $mapaParts

# ---------- CAPACITACIONES.JS ----------
$capHeader = @'
// -- CAPACITACIONES . navegacion, progreso, quiz y Guia de venta ----------
// NOTA (hallazgo de migracion): renderGuia/goGuiaStep estaban duplicadas
// palabra por palabra en el archivo original (una copia autocontenida junto
// a GUIA_STEPS, y otra identica mas adelante junto a EVENTOS), cada una con
// su propia llamada renderGuia() al cargar. Se preservan ambas copias tal
// cual para no alterar el comportamiento -- es dead code, reportado para
// decidir en una run aparte si se elimina.
'@
$capacitacionesParts = @(
  $capHeader,
  (Lines 5158 5199),  # renderGuia + goGuiaStep + call (copy 1)
  (Lines 5574 5587), (Lines 5588 5662), (Lines 5663 5778),
  (Lines 5779 5794), (Lines 5795 5809), (Lines 5810 5820),
  (Lines 5821 5830), (Lines 5831 5840),
  (Lines 7114 7240),  # RUN 9B block, part 1 (hasta antes de quizSelections/quizSubmitted -- esas quedan en estado.js)
  (Lines 7243 7318),  # RUN 9B block, part 2
  (Lines 8490 8532)   # renderGuia + goGuiaStep + call (copy 2, duplicate)
)
WriteFile 'js/capacitaciones.js' $capacitacionesParts

# ---------- HOME.JS ----------
WriteFile 'js/home.js' @((Lines 7873 7895)) "`n"

# ---------- ONBOARDING.JS ----------
$onboardingParts = @(
  '// -- ONBOARDING . OB_STEPS vive aca (dato usado solo por este modulo) ----',
  (Lines 7903 7930),  # OB_STEPS (hasta antes de _obStep -- queda en estado.js)
  (Lines 7932 8008)
)
WriteFile 'js/onboarding.js' $onboardingParts

# ---------- ADMIN.JS ----------
$adminHeader = @'
// -- ADMIN . gestion de usuarios -------------------------------------------
// NOTA (hallazgo de migracion): adminDelete/togglePwdVisibility estaban
// duplicadas palabra por palabra en el archivo original. Se preservan ambas
// copias tal cual (dead code inofensivo, la ultima declaracion gana) --
// reportado para decidir en una run aparte si se elimina.
'@
$adminParts = @(
  $adminHeader,
  (Lines 8560 8581), (Lines 8582 8595), (Lines 8596 8604), (Lines 8605 8613),
  (Lines 8614 8624), (Lines 8625 8741), (Lines 8742 8748), (Lines 8749 8754),
  (Lines 8755 8762), (Lines 8763 8766), (Lines 8767 8779), (Lines 8780 8797),
  (Lines 8798 8845), (Lines 8846 8873), (Lines 8874 8918), (Lines 8919 8926),
  (Lines 8927 8961), (Lines 8962 8991),
  (Lines 8992 9020), (Lines 9021 9030),  # copy 1
  (Lines 9031 9057), (Lines 9058 9066)   # copy 2, duplicate
)
WriteFile 'js/admin.js' $adminParts

# ---------- EVENTOS.JS ----------
$eventosParts = @(
  (Lines 8353 8356), (Lines 8364 8383), (Lines 8384 8403), (Lines 8404 8420),
  (Lines 8421 8434), (Lines 8435 8440), (Lines 8441 8468),
  (Lines 8477 8483), (Lines 8484 8487), (Lines 8488 8488),
  (Lines 8534 8543)
)
WriteFile 'js/eventos.js' $eventosParts

# ---------- MAIN.JS ----------
$mainHeader = @'
// -- MAIN . arranque de la aplicacion ---------------------------------------
// Debe cargar ultimo: initAuth() -> mountPortal() referencia funciones de
// TODOS los modulos anteriores (incluido renderAdmin() de admin.js).
'@
WriteFile 'js/main.js' @($mainHeader, (Lines 8546 8546)) "`n"

Write-Output "Migration extraction complete."
