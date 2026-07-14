# Migración técnica — Portal Bullpadel 2026

Ejecución de `BRIEF_migracion_tecnica.md`: división de `index.html` en shell + `css/` + 14 módulos `js/`, y reemplazo de imágenes embebidas en base64 por archivos reales.

**Fecha:** 10 de julio de 2026

---

## Resumen

| Métrica | Valor |
|---|---|
| Peso original (1 archivo) | 3.07 MB |
| Peso nuevo — código (16 archivos) | 469.8 KB |
| Reducción de payload de **código** | -84.7% |
| Peso total del sitio — antes vs. después | 3.07 MB → 2.42 MB (-21.4%) |
| Bugs de migración hallados y corregidos | 11 |

> ⚠️ **-84.7% y -21.4% miden cosas distintas** — ver sección 2 bis para el detalle y por qué no son comparables directamente.

---

## 1. Estructura generada

Un shell + 15 archivos, en el orden de carga exacto del brief. El orden de `<script src>` es crítico: `data.js` primero porque todo depende de sus arrays; `main.js` al final porque `initAuth()` dispara `mountPortal()`, que llama `renderAdmin()` — si `main.js` no fuera el último, esa llamada rompería con `ReferenceError`.

| Archivo | Peso | Contenido |
|---|---|---|
| `index.html` | 41.6 KB | Shell: `<head>`, todo el markup del `<body>` original, `<link>` a CSS y los 14 `<script src>` al final |
| `css/styles.css` | 112.7 KB | Todo el `<style>` original, sin cambios de contenido |
| `js/data.js` | 160.3 KB | PALAS, MATERIALES, TECNOLOGIAS, JUGADORES, USUARIOS, ROLES, COMPETENCIA, CONFIG, ITEMS, GUIA_STEPS, CAPACITACIONES, PALAS_COMPETENCIA + helpers `palaImgSrc()` / `itemImgSrc()` |
| `js/estado.js` | 0.7 KB | Variables globales mutables, centralizadas: currentUser, currentMod, recAnswers, compareContext, etc. |
| `js/helpers.js` | 2.1 KB | estiloClass, nivelClass, normalizeStr, palHaystack, normalizarTexto, hayPalabra |
| `js/auth.js` | 8.6 KB | getUsers/saveUsers/seedUsers, sesión, handleLogin/Logout, mountPortal, applyRolePermissions, initAuth |
| `js/catalogo.js` | 27.5 KB | renderPalas + filtros, renderItems, vista gama completa + export CSV, ficha individual de pala, detail modal de materiales |
| `js/recomendador.js` | 29.0 KB | scorePala, poolPrincipalPorNivel, recomendarPalas, explicaciones, frase de venta, render de resultados |
| `js/comparador.js` | 15.7 KB | Selección de palas, resumen y highlights comerciales, renderComp, onCompSelectChange |
| `js/mapa-competitivo.js` | 16.5 KB | Selects marca/modelo, explicación por rol, render de alternativas Bullpadel sugeridas |
| `js/capacitaciones.js` | 25.5 KB | Guía de venta, recursos (video/infografía), navegación de módulos/unidades, progreso + checklist + quiz completo |
| `js/home.js` | 0.8 KB | renderHomeStats |
| `js/onboarding.js` | 3.6 KB | OB_STEPS + navegación del modal de bienvenida |
| `js/admin.js` | 19.5 KB | CRUD de usuarios, renderAdmin, alertas y validaciones del panel |
| `js/eventos.js` | 5.3 KB | showSection + legacyMap, subnavs de Catálogo/Capacitaciones, lightbox, wiring de DOMContentLoaded |
| `js/main.js` | 0.2 KB | Única línea: `initAuth();` — debe cargar último |

---

## 2. Imágenes: de base64 embebido a archivos reales

Las 62 imágenes (29 palas + 33 materiales/tecnologías) ya estaban extraídas en `img/palas/` e `img/materiales/`. Se reemplazaron los 12 puntos de uso de `IMGS[id]` / `ITEM_IMGS[cod]` en catálogo, ficha individual, comparador, recomendador y mapa competitivo por dos helpers en `data.js`, y se eliminó por completo el bloque base64 original (`const IMGS={...}` + `const ITEM_IMGS={...}`), que pesaba **2,598,424 bytes (2.48 MB) exactos** — medido directamente contra el `index.html` commiteado en `HEAD`, no estimado.

**Caso borde encontrado:** la tecnología "Custom Weight" tiene `cod:"CustomWeight"` pero `id:"CW"`, y nunca tuvo imagen ni en el `ITEM_IMGS` original ni en `img/materiales/`. `itemImgSrc()` preserva ese comportamiento (sin imagen, sin 404) con un `Set` explícito de una entrada — mismo resultado visual que antes, ahora sin depender de un objeto de 2.48 MB para saberlo.

---

## 2 bis. Peso total del sitio: código vs. código + imágenes

La reducción de **-84.7%** de la sección de arriba compara el archivo monolítico viejo (que incluía las imágenes embebidas) contra el código nuevo solo (que ya no las incluye) — es una métrica real pero parcial: mide cuánto adelgazó el HTML/CSS/JS, no cuánto pesa el sitio completo hoy.

Para el peso total real hay que sumar `img/` (que hoy sí se sirve y se cachea; antes del brief ya estaba extraída en disco pero no se usaba desde ningún lado del código):

| | Antes | Después |
|---|---|---|
| Código (HTML+CSS+JS) | 3,074,383 B (3.07 MB) | 469,791 B (469.8 KB) |
| `img/` (29 palas + 33 materiales) | *(en disco, sin referenciar)* | 1,946,726 B (1.95 MB) |
| **Total servido por el sitio** | **3.07 MB** | **2.42 MB** |
| **Reducción total** | | **-21.4%** |

**Por qué la reducción total (-21.4%) es mucho menor que la de código (-84.7%):** el peso de las imágenes no desaparece, se reubica. Antes viajaba infladas ~33% por la codificación base64 dentro del JS (2.48 MB de base64 para representar ~1.95 MB de binario real); ahora viaja como archivos reales, sin esa inflación, y con la ventaja adicional — que no entra en ningún conteo de bytes — de que el navegador las cachea entre visitas y páginas, cosa que el base64 embebido en el script nunca permitía.

---

## 3. Metodología de validación

`node --check` —el método que pedía `CONTEXT.md`— no se pudo correr: no hay Node ni WSL instalados en esta máquina. Python sí estaba disponible, así que se sirvió el proyecto con `python -m http.server` y se validó en el navegador embebido en tres capas, cada una más estricta que la anterior:

1. **Parseo** — `new Function(code)` sobre cada archivo, equivalente a `node --check`. Encontró 8 de los 11 bugs (llaves y arrays sin cerrar).
2. **Punto ciego descubierto** — un comentario `/* ═══` sin cerrar puede "cerrarse" por accidente con el `*/` de un comentario posterior: sintaxis válida, pero las funciones en el medio quedan comentadas y desaparecen en silencio. `new Function()` no lo detecta.
3. **Verdad de terreno** — se comparó la lista completa de las 178 declaraciones top-level del archivo original contra `typeof` de cada una ya cargada en `window`. Esto detectó el punto ciego de arriba y confirmó, al final, 176/176 identificadores presentes (176 = 178 menos `IMGS`/`ITEM_IMGS`, eliminados a propósito).

---

## 4. Bugs encontrados y corregidos

Ninguno viene del archivo original: son errores de límites de rango al extraer funciones de un archivo de 9.571 líneas. Se corrigieron tanto en el archivo final como en `scripts/migrate.ps1`, para que el proceso sea reproducible.

| # | Archivo | Función(es) | Problema |
|---|---|---|---|
| 1 | `data.js` | `PALAS_COMPETENCIA` | Array sin cerrar — faltaba el `];` final, el rango cortaba una línea antes de tiempo |
| 2 | `catalogo.js` | `detailModalBgClick`, `goToComparador` | Comentario huérfano — el rango se pasaba 4 líneas hacia el siguiente banner `/* ═══`, dejándolo sin cerrar |
| 3 | `comparador.js` | `onCompSelectChange` | Mismo patrón: 3 líneas de más hacia el banner de "MAPA COMPETITIVO" |
| 4 | `capacitaciones.js` | `capNavPrev` | Llave sin cerrar — rango un línea corto, faltaba la `}` de cierre |
| 5 | `home.js` | `renderHomeStats` | Función incompleta — faltaban las 2 líneas finales (`.join('');` y la `}` de cierre) |
| 6 | `onboarding.js` | listener de Escape | Listener a medias — el `addEventListener('keydown', ...)` quedó cortado en medio del cuerpo |
| 7 | `eventos.js` | toggleMobileNav, openLightbox, closeLightbox, keydown, DOMContentLoaded | Corrimiento de línea en cadena — una transcripción manual quedó corrida en +1, afectando 5 fragmentos consecutivos. Se re-derivaron todos los límites con `grep` exacto |
| 8 | `helpers.js` | normalizeStr, palHaystack, normalizarTexto, hayPalabra | **Silencioso, no lo detecta el parser.** El rango de `nivelClass` se pasó 3 líneas hacia el banner "5. RENDER", dejando un `/* ═══` abierto que se cerraba por casualidad con el `*/` de un comentario 14 líneas más abajo. Sintaxis 100% válida — pero las 4 funciones del medio quedaban comentadas y no existían en runtime. Encontrado recién al comparar `typeof` contra el inventario completo de identificadores |
| 9 | `catalogo.js` | normalizeStr, palHaystack | Gap de extracción — se usan en `renderPalas()` pero nunca quedaron asignadas a ningún archivo, un vacío puro en el mapeo original. Apareció como `ReferenceError` real al probar el catálogo |
| 10 | `estado.js` | quizSelections, quizSubmitted, _obStep | Redeclaración cruzada — quedaron declaradas tanto en `estado.js` como en su módulo original, porque el rango las incluía de arrastre. Con `let`/`const` compartiendo scope global entre `<script>` tags, esto tira `SyntaxError: already been declared` al cargar |

> El bug #8 es el más importante de tener en cuenta: es la clase de error que `node --check` tampoco habría atrapado — hacía falta la verificación de "¿existe en runtime?", no solo "¿es sintaxis válida?".

---

## 5. Validación funcional

Los 8 puntos del brief, probados en el navegador real:

- [x] Login con las 3 cuentas demo — owner, vendedor, usuario (`currentUser` verificado tras cada login)
- [x] Navegación completa — Inicio → Catálogo (Palas / Vista gama / Materiales) → Recomendador → Comparador (Bullpadel / Mapa Competitivo) → Capacitaciones (Módulos / Guía de venta)
- [x] Imágenes de palas y materiales cargando desde `img/palas/` e `img/materiales/`
- [x] Recomendador calcula y muestra resultados (4.956 caracteres de HTML de resultado tras completar las 6 preguntas)
- [x] Comparador carga 3 palas y renderiza la tabla comparativa
- [x] Capacitaciones reproduce video embebido de YouTube (iframe con `src` válido confirmado)
- [x] Administración lista usuarios (3 seed) y crea uno nuevo (4to, con validación de "cliente mayorista" para rol `usuario` funcionando)
- [x] `verCompetencia` bloquea Mapa Competitivo para `usuario` (nav oculto + guard de función verificado con `showComparadorTab('mapa', null)` llamado directo) y lo permite para `vendedor`/`owner`

Cero errores de consola y cero requests fallidos en toda la sesión de pruebas, en las 3 sesiones de rol distintas.

---

## 6. Código muerto encontrado (reportado, no eliminado)

- **`capacitaciones.js`** — `renderGuia` / `goGuiaStep` estaban duplicadas palabra por palabra en el archivo original: una copia autocontenida junto a `GUIA_STEPS`, y otra idéntica más adelante junto a la sección de eventos, cada una con su propia llamada `renderGuia()` al cargar. Se preservaron ambas copias tal cual (inofensivo: la segunda declaración simplemente pisa a la primera con el mismo cuerpo).
- **`admin.js`** — `adminDelete` / `togglePwdVisibility`, mismo patrón: duplicadas y preservadas.

**Verificación pedida — grep de `function nombreX(` en los 14 archivos:**

```
155 declaraciones "function" totales en js/*.js
151 nombres únicos
4 nombres duplicados: togglePwdVisibility, renderGuia, goGuiaStep, adminDelete
```

Confirmado además, por archivo, que **los 4 duplicados son intra-archivo, no entre archivos distintos**:

| Nombre duplicado | Archivo(s) donde aparece |
|---|---|
| `renderGuia` | `js/capacitaciones.js` (×2) |
| `goGuiaStep` | `js/capacitaciones.js` (×2) |
| `adminDelete` | `js/admin.js` (×2) |
| `togglePwdVisibility` | `js/admin.js` (×2) |

Es decir: no hay ningún caso de dos archivos distintos definiendo la misma función global (que sería el escenario realmente riesgoso — dos módulos "creyendo" que son dueños de un nombre). Los 4 duplicados son copias redundantes dentro del mismo archivo, exactamente los 2 pares ya documentados arriba, y ninguno más.

---

## 7. Desvíos de la propuesta original

- **No se creó `render-core.js`.** Todo lo que vivía bajo el banner "5. RENDER" del archivo original pertenecía naturalmente a `catalogo.js` o `comparador.js` — no había nada genuinamente compartido entre módulos no relacionados que justificara un archivo intermedio.
- **`normalizeStr` / `palHaystack` fueron a `helpers.js`** junto a `normalizarTexto`/`hayPalabra`, en vez de quedarse sueltas en `catalogo.js`, para centralizar todas las utilidades de texto en un solo lugar.
- **`OB_STEPS` quedó en `onboarding.js`** (no en `data.js` como sugería la propuesta) — es contenido usado exclusivamente por ese módulo, no dato de negocio compartido.

---

## 8. Estado del repo

- **Sin tocar:** la modificación previa de `.gitignore` (agrega `CONTEXT.md`) ya estaba sin commitear *antes* de esta run — no es mía, no la incluí en el bundle de la migración.
- **Limpieza de esta sesión:** se borró `index_original_backup.html` (copia de seguridad temporal que hice yo — el original queda intacto en el historial de git) y los `scripts/chunk_*.js` de testing. Quedaron `scripts/migrate.ps1` y `scripts/build-shell.ps1` como herramientas reproducibles de esta migración, y `.claude/launch.json` para levantar el servidor estático de prueba en el futuro.
- **Pendiente:** un solo commit con `.gitignore` sin tocar, `index.html`, `css/`, `js/`, `scripts/`, `.claude/` y `BRIEF_migracion_tecnica.md` — y el `git push` correspondiente. A la espera de tu confirmación.
