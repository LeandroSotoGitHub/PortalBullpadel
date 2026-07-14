# BRIEF — Nueva feature: Media Center

> Leer `CONTEXT.md` completo antes de empezar si no lo tenés cargado en esta sesión.

---

## Qué es

Un nuevo módulo del portal que funciona como **índice de acceso a material de marketing y producto alojado en Google Drive** — banners, fotos en alta resolución, videos, material de jugadores, archivo histórico de temporadas anteriores.

**No es un repositorio de archivos dentro del portal.** El portal no aloja ni sirve ninguno de estos archivos — cada card es simplemente un **link externo** que abre la carpeta de Drive correspondiente en una pestaña nueva. El usuario navega y descarga directo desde Drive.

---

## Datos reales — ya verificados, no inventar nada

Se adjunta `media_links.json` con la estructura completa y real: **3 categorías de primer nivel, 29 subcarpetas en total**, cada una con su URL real de Google Drive (verificadas directamente contra Drive, no son placeholders).

Estructura del JSON:
```
{
  "01 Imagenes de Marketing": { url, subcarpetas: [ {nombre, url}, ... 8 items ] },
  "02 Imagenes de producto":  { url, subcarpetas: [ {nombre, url}, ... 13 items ] },
  "03 Archivo Historico":     { url, subcarpetas: [ {nombre, url}, ... 8 items ] }
}
```

**Tarea:** convertir este JSON en un array/objeto `MEDIA_CENTER` dentro de `data.js`, siguiendo el mismo estilo de definición que ya usan `CAPACITACIONES` o `PALAS_COMPETENCIA` en ese archivo. Usar los nombres y URLs exactamente como están en el JSON adjunto — no reformular, no traducir, no resumir los nombres de carpeta.

---

## Dónde vive en la navegación

**Séptimo ítem del menú principal**, agregado a los 6 que ya existen:

```
Inicio | Catálogo | Recomendador | Comparador | Capacitaciones | Media Center | Administración
```

(El orden exacto entre Capacitaciones y Administración queda a criterio — usar el que se sienta más natural en la barra.)

**Visibilidad: los 3 roles, sin restricción.** A diferencia del Mapa Competitivo (que está restringido a `owner`/`vendedor` vía `verCompetencia`), este módulo debe ser visible para `owner`, `vendedor` y `usuario` por igual. Si se agrega un permiso nuevo al objeto `ROLES` por consistencia con el resto del sistema (por ejemplo `verMediaCenter`), debe quedar en `true` para los 3 roles — no usarlo como gate real, es solo por prolijidad de patrón si aplica.

---

## Diseño — sin mockup, resolver con el mismo criterio que ya usa el portal

No hay una referencia visual específica para esta pantalla. **Se pide explícitamente que la resuelvas vos con el mismo criterio de diseño ya aplicado en el resto del portal** — reutilizando los patrones de card, spacing, tipografía y color que ya existen (por ejemplo, el estilo de cards de `mapa-competitivo.js` o de los accesos rápidos de `home.js` son buenas referencias de tono visual para algo que es, en esencia, una grilla de tarjetas que llevan a un destino externo).

Algunas sugerencias de estructura, no obligatorias — usar criterio propio si algo se resuelve mejor distinto:

- Las 3 categorías de primer nivel pueden mostrarse como secciones separadas (tipo "estantes"), cada una con su propio grid de cards para las subcarpetas — dado que son solo 8, 13 y 8 items respectivamente, probablemente no hace falta un sistema de tabs/subnav adicional, con tres bloques apilados alcanza.
- Cada card de subcarpeta como mínimo necesita: nombre de la carpeta, e indicación visual de que es un link externo (ícono de salida, o algún tratamiento que dejeclaro que abre Drive en pestaña nueva).
- Los links deben abrir con `target="_blank" rel="noopener noreferrer"` — mismo patrón de seguridad que ya se usa en los links de infografías de Capacitaciones.

---

## Casos borde en los datos — resolver con criterio, no bloquear la implementación

- **"10 Pack Vertex 25"** vive dentro de la categoría "02 Imagenes de producto" (2026) pero es contenido de temporada 2025. Se puede dejar tal cual está en la estructura de datos (fiel a como está organizado en Drive), o agruparlo visualmente distinto si se considera que mejora la claridad — decisión de criterio propio, documentar qué se eligió.
- Los nombres de carpeta ya vienen limpios del JSON (la numeración duplicada que existía originalmente en "Archivo Histórico" ya fue corregida en la fuente) — no hace falta relimpiarlos.

---

## Qué NO hacer

- No descargar, copiar ni alojar ningún archivo de esas carpetas de Drive dentro del repo — el módulo es puramente de navegación/índice hacia contenido externo.
- No inventar categorías, subcarpetas o URLs que no estén en `media_links.json`.
- No mostrar precio, stock, SKU ni EAN (aplica igual que en el resto del portal, aunque acá es poco probable que surja).
- No restringir por rol.
- No tocar ningún otro módulo existente — esto es una feature nueva y aislada.

---

## Validación antes de terminar

1. `node --check` sobre `data.js` (con `MEDIA_CENTER` agregado) y sobre el nuevo archivo `.js` del módulo (sugerido: `js/media-center.js`, agregado al orden de carga en `index.html` junto a los demás módulos de sección — no necesita ir en un lugar específico del orden ya que no depende de otros módulos ni es dependencia de ninguno, salvo `data.js` que sí debe cargar antes).
2. Confirmar que las 29 subcarpetas + las 3 categorías están representadas y son clickeables.
3. Confirmar que los 3 roles (owner/vendedor/usuario) ven el ítem "Media Center" en el nav.
4. Confirmar que cada link abre Drive en pestaña nueva (no navega fuera del portal en la misma pestaña).
5. Responsive: que el grid de cards no rompa en mobile (mismo chequeo de overflow horizontal que se hizo en la migración técnica).

## Qué reportar al terminar

- Cómo se estructuró visualmente el módulo y por qué (qué patrón existente se tomó como referencia).
- Qué se decidió con el caso de "Pack Vertex 25".
- Confirmación de los 5 puntos de validación.
