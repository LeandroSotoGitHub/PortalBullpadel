# BRIEF — Migración técnica: división de archivos + imágenes reales

> Este brief es para Claude Code. Antes de empezar, leer también `CONTEXT.md` en la raíz del repo (si existe en ese momento) para entender arquitectura y reglas de negocio generales del portal.

---

## Objetivo de esta run

Dos cosas, en el mismo trabajo:

1. **Dividir `index.html`** (hoy ~2.9MB, todo en un solo archivo) en un shell HTML + archivos `.css`/`.js` separados por módulo.
2. **Reemplazar las imágenes embebidas en base64** (`IMGS` y `ITEM_IMGS`, dentro del JS) por referencias a archivos reales, ya extraídos y disponibles en `img/palas/` e `img/materiales/`.

**Esto es una run de reorganización de infraestructura, no de producto.** Ningún comportamiento visible del portal debe cambiar: mismo login, misma navegación, mismos módulos, mismos datos, mismo diseño. Al terminar, el portal tiene que verse y funcionar exactamente igual que antes — solo que el código vive ordenado en varios archivos en vez de uno solo, y pesa menos.

---

## Por qué se hace (contexto para no perder de vista el criterio)

- El archivo único ya no tiene la restricción original que lo justificaba (poder abrirlo como `file://` sin servidor) — esa restricción se rompió hace tiempo porque los videos de YouTube embebidos ya requieren servidor real (`https://` o `localhost`).
- El proyecto vive en un repo Git real, desplegado en GitHub Pages. No hay necesidad de mantenerlo como archivo único.
- Trabajar sobre un archivo de 2.9MB es lento e impreciso para cualquier herramienta de edición, incluido Claude Code. Archivos chicos y enfocados por módulo permiten ediciones más rápidas y seguras.
- Las imágenes en base64 pesan ~33% más que el binario original, no se cachean en el navegador, y ensucian el historial de Git con diffs ilegibles cada vez que cambian.

---

## Imágenes: ya extraídas, solo falta referenciarlas

**No hace falta decodificar ni generar las imágenes** — ya están en el proyecto, en:

```
img/palas/<id>.jpg        (29 archivos — mismos ids que pala.id en PALAS)
img/materiales/<id>.png   (33 archivos — mismos ids que los códigos de MATERIALES/TECNOLOGIAS)
```

Los nombres de archivo coinciden exactamente con las keys que usan hoy `IMGS[id]` e `ITEM_IMGS[id]` en el código — no requiere ningún mapeo manual, es 1:1.

**Tarea:** reemplazar todo uso de `IMGS[pala.id]` (string base64 gigante) por una ruta relativa `img/palas/${pala.id}.jpg`, y `ITEM_IMGS[cod]` por `img/materiales/${cod}.png`. Buscar **todos** los lugares donde se usan estas dos constantes — no son solo un par de `<img src>`, se usan en múltiples módulos: catálogo, ficha individual de pala, comparador, recomendador, mapa competitivo, materiales/tecnologías, guía de venta si aplica. Verificar con grep exhaustivo antes de dar por terminada la tarea.

Una vez reemplazadas todas las referencias, **eliminar completamente** los objetos `const IMGS = {...}` y `const ITEM_IMGS = {...}` del código — son la fuente principal de peso del archivo y ya no deben quedar como dead code.

---

## División de archivos propuesta

Basado en el mapa real de secciones del JS actual:

```
index.html                    (shell: <head>, <body>, <script src> en orden)
css/
  styles.css                  (~101KB — todo el <style> actual, sin cambios de contenido)
js/
  data.js                     (PALAS, MATERIALES, TECNOLOGIAS, ITEMS, JUGADORES,
                                USUARIOS, ROLES, COMPETENCIA, CONFIG, CAPACITACIONES,
                                GUIA_STEPS, PALAS_COMPETENCIA — TODO sin las imágenes,
                                que ahora se referencian por ruta)
  estado.js                   (variables globales: currentUser, currentMod, recAnswers,
                                compareContext, etc.)
  auth.js                     (seedUsers, initAuth, mountPortal, applyRolePermissions,
                                handleLogin/Logout, getUsers/saveUsers)
  helpers.js                  (normalizarTexto, hayPalabra, y demás utilitarios
                                compartidos entre módulos)
  render-core.js               (funciones de render genéricas de sección — la que hoy
                                está marcada como "5. RENDER")
  catalogo.js                 (renderPalas, filtros, búsqueda, ficha individual de pala,
                                detail modal de materiales/tecnologías — Run 7)
  recomendador.js              (scorePala, recomendarPalas, poolPrincipalPorNivel,
                                explicarRecomendacion, fraseVenta, etiquetaAlternativa,
                                generarResumenPerfil, renderResultadosRecomendador)
  comparador.js                (getSelectedComparePalas, buildCompareSummary,
                                buildCompareHighlights, getPalaCommercialLabel,
                                buildPalaSalesPhrase, compareContext, renderComp)
  mapa-competitivo.js          (showComparadorTab, onMapaMarcaChange/ModeloChange,
                                explicarAlternativaMapa, renderMapaResult,
                                compararAlternativasBullpadel)
  capacitaciones.js            (renderCapacitaciones, selectCapMod/Unit, capNavNext/Prev,
                                progreso/checklist/quiz — Run 9B, renderRecursosBlock)
  home.js                      (renderHomeStats, lógica de accesos rápidos)
  onboarding.js                 (getOnboardingKey, hasSeenOnboarding, openOnboarding,
                                renderOnboardingStep)
  admin.js                      (adminCreateUser, adminDelete, togglePwdVisibility,
                                render del panel de administración)
  eventos.js                    (listeners globales, DOMContentLoaded, showSection y su
                                legacyMap — DEBE cargar después de todos los módulos
                                anteriores porque los referencia)
  main.js                       (llamada final a initAuth() — última línea de ejecución)
```

Este split es una propuesta de referencia según cómo está organizado el código hoy — si al ejecutar la migración aparece código que no encaja limpio en ninguna de estas categorías, usar criterio y agruparlo donde tenga más sentido semántico, documentando la decisión en el propio código con un comentario breve.

---

## Orden de carga en `index.html` — crítico, no cambiar

Los `<script src="...">` deben cargar en este orden exacto, porque cada archivo depende de que el anterior ya haya definido sus variables/funciones globales:

```html
<script src="js/data.js"></script>
<script src="js/estado.js"></script>
<script src="js/helpers.js"></script>
<script src="js/auth.js"></script>
<script src="js/render-core.js"></script>
<script src="js/catalogo.js"></script>
<script src="js/recomendador.js"></script>
<script src="js/comparador.js"></script>
<script src="js/mapa-competitivo.js"></script>
<script src="js/capacitaciones.js"></script>
<script src="js/home.js"></script>
<script src="js/onboarding.js"></script>
<script src="js/admin.js"></script>
<script src="js/eventos.js"></script>
<script src="js/main.js"></script>
```

`data.js` va primero porque `PALAS`, `MATERIALES`, `CAPACITACIONES`, etc. son usados por prácticamente todos los demás archivos. `main.js` va último porque dispara `initAuth()`, que a su vez llama `mountPortal()`, que depende de que **todas** las funciones de render de todos los módulos ya estén definidas en el scope global.

No usar `type="module"` ni imports/exports de ES6 — mantener scripts clásicos con variables/funciones en scope global, tal como funciona hoy dentro del archivo único. Esto evita tener que reescribir cómo cada función accede a los datos y no introduce ningún build step.

---

## Qué NO tocar en esta run

- **Ninguna lógica de negocio.** El scoring del recomendador, las reglas de PROLINE, los permisos por rol, la validación de datos del mapa competitivo — todo el comportamiento funcional queda exactamente igual. Esta run es "cortar y pegar en archivos distintos", no "reescribir cómo funciona algo".
- **No renombrar funciones ni variables** salvo que sea estrictamente necesario para resolver un conflicto de scope. Si hay que renombrar algo, documentarlo explícitamente en el resumen de la run.
- **No introducir frameworks, bundlers, ni npm packages.** Sigue siendo HTML+CSS+JS puro, ahora repartido en más archivos.
- **No tocar el contenido de `CAPACITACIONES`, `PALAS`, `PALAS_COMPETENCIA`** ni ningún dato — solo su ubicación de archivo y la forma en que las imágenes se referencian.
- **No tocar `.gitignore`** existente (ya excluye `Catalogo/`, `desktop.ini`, `CONTEXT.md`) salvo que sea necesario agregar algo nuevo relacionado a esta migración.

---

## Validación antes de dar por terminada la run

1. **Cada archivo `.js` debe pasar `node --check` individualmente.**
2. **Abrir el portal (servido, no `file://`, por los videos de YouTube) y probar manualmente:**
   - Login con las 3 cuentas demo (owner/vendedor/usuario)
   - Navegación completa: Inicio → Catálogo (los 3 subtabs) → Recomendador → Comparador (ambos subtabs, incluido Mapa Competitivo) → Capacitaciones (ambos subtabs)
   - Que las imágenes de palas y de materiales/tecnologías carguen correctamente desde las rutas nuevas
   - Que el Recomendador calcule y muestre resultados
   - Que el Comparador cargue palas y muestre la tabla
   - Que Capacitaciones reproduzca al menos un video embebido
   - Que Administración liste usuarios y permita crear uno nuevo
   - Confirmar que `verCompetencia` sigue restringiendo el Mapa Competitivo para el rol `usuario`
3. **Revisar consola del navegador** — cero errores de JS, cero 404 de imágenes.
4. **Comparar el peso total del proyecto antes/después** y reportarlo (referencia: el `index.html` único pesaba ~2.9MB; el objetivo es que el nuevo `index.html` shell sea liviano — unos pocos KB — y que el total de archivos `.js`+`.css` sin imágenes baje considerablemente respecto al original, dado que se eliminó ~1.86MB de base64).

---

## Qué reportar al terminar

- Peso final de cada archivo generado (`index.html`, cada `.js`, `.css`)
- Confirmación de que los 8 puntos de la validación manual pasaron
- Cualquier decisión de organización que se haya tomado distinta a la propuesta en este brief (por ejemplo, si algo no encajaba limpio en ningún módulo y se ubicó distinto)
- Si se detecta código muerto o duplicado durante la migración (es común encontrarlo al reorganizar), señalarlo pero **no eliminarlo sin confirmación** — reportarlo como hallazgo para decidir en una run aparte.

---

## Después de esta run

Una vez validado todo localmente:

```bash
git add .
git commit -m "migrate to modular file structure + real image files"
git push
```

Un solo commit limpio con todo el cambio junto — no hacer commits parciales intermedios de esta migración.
