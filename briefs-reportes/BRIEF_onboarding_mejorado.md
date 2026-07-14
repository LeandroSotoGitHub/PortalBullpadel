# BRIEF — Onboarding mejorado: ilustraciones, tips contextuales y cierre por rol

> Leer `CONTEXT.md` completo antes de empezar, en particular la sección 12 (Onboarding actual).

---

## Contexto — qué existe hoy

Modal de bienvenida de 5 pasos, texto puro, se muestra una sola vez por usuario al primer login (`hasSeenOnboarding()` / `bp2026_onboarding_<userId>` en localStorage), reabrible manualmente desde "Ver bienvenida nuevamente" en Home. Vive en `js/onboarding.js`, estructura de datos `OB_STEPS`.

**Esto no se reemplaza — se mejora y se le suma una capa nueva.** No hacer un rewrite completo de la arquitectura existente.

---

## Objetivo — 3 mejoras combinadas

### 1. Ilustraciones CSS/SVG en el modal existente (reemplaza texto puro)

Cada uno de los 5 pasos de `OB_STEPS` debe sumar una mini-ilustración liviana construida en **CSS/SVG puro, sin archivos de imagen ni GIFs**. La idea es mostrar, no solo describir — por ejemplo, si el paso habla del Recomendador, una representación simplificada de cómo se ve una card de resultado (silueta de card con badge y botón), no un párrafo describiéndolo.

**Restricciones duras:**
- Sin imágenes externas, sin GIFs, sin librerías de animación.
- Reutilizar la paleta de marca ya establecida (negro/rojo/blanco/grises) y los mismos radios/sombras/transiciones que ya definidas en `css/styles.css`.
- Livianas — es código (SVG inline o divs con CSS), no assets que pesen.
- Pueden tener una animación de entrada sutil (fade/scale, mismo patrón ya usado en el resto del portal — ver `@keyframes` existentes en `styles.css`), pero nada llamativo ni con movimiento continuo/loop que distraiga.

No hace falta una ilustración distinta y elaborada por paso — si para algún paso alcanza con un ícono/silueta simple, es preferible a forzar algo complejo. Usar criterio.

### 2. Tips contextuales por módulo (capa nueva, independiente del modal)

Además del modal de bienvenida general, agregar **micro-tips que aparecen la primera vez que el usuario entra a cada módulo específico** — Catálogo, Recomendador, Comparador, Capacitaciones (Media Center y Administración quedan afuera de esta capa, no son prioritarios para este ajuste).

**Formato sugerido:** un tooltip/banner chico y descartable (no un modal que bloquee la pantalla), que aparece una sola vez por usuario por módulo, con una frase corta indicando qué hacer ahí. Ejemplo de tono: *"Elegí las 6 preguntas y te mostramos las 3 palas más indicadas para tu cliente."*

**Requisitos:**
- Debe poder cerrarse manualmente (botón de cerrar) y no debe volver a aparecer una vez descartado.
- Debe guardarse en localStorage con su propio namespace, separado del modal principal — sugerido: `bp2026_onboarding_tip_<moduleId>_<userId>`.
- No debe bloquear la interacción con el módulo — el usuario tiene que poder usar la sección normalmente aunque el tip siga visible.
- Se dispara la primera vez que `showSection()` navega a ese módulo para ese usuario — implementar el hook donde tenga más sentido dentro de `js/eventos.js` o `js/onboarding.js`, sin duplicar lógica de navegación ya existente.

### 3. Cierre del modal dirigido por rol

El botón final del modal de 5 pasos ("Empezar a usar el portal" o el texto que tenga hoy) debe **navegar a un destino distinto según el rol del usuario logueado** (`currentUser.rol`), en vez de solo cerrar el modal sin acción:

- `usuario` (Distribuidor) → navegar a **Recomendador**
- `vendedor` (Vendedor Bullpadel) → navegar a **Comparador**
- `owner` (Admin) → cerrar el modal sin redirección forzada (o llevarlo a Inicio, lo que se sienta más natural — el admin no tiene un caso de uso comercial único como los otros dos roles)

Usar la función de navegación ya existente (`showSection`), no duplicar lógica.

---

## Qué pasa con "Ver bienvenida nuevamente"

Mantener el comportamiento actual sin cambios — sigue reabriendo el modal de 5 pasos completo desde el paso 1, ahora con las ilustraciones nuevas y el cierre dirigido por rol. **No** hace falta que ese botón también resetee o vuelva a mostrar los tips contextuales por módulo — son capas independientes a propósito, para no complicar la lógica de replay.

---

## Qué NO tocar

- La estructura de datos `OB_STEPS` puede extenderse (agregar campo de ilustración por paso) pero no reordenar ni cambiar el contenido de texto existente de los 5 pasos salvo que haga falta ajustarlo para que combine bien con la ilustración nueva.
- No tocar `hasSeenOnboarding()`, `markOnboardingSeen()`, ni la key de localStorage del modal principal — siguen funcionando exactamente igual.
- No tocar ningún otro módulo (Catálogo, Recomendador, Comparador, Capacitaciones) más allá de agregar el hook de disparo del tip contextual — cero cambios a su lógica interna o diseño.
- Nada de esto debe requerir backend ni librerías externas.

---

## Validación antes de terminar

1. `node --check` sobre `js/onboarding.js` y cualquier otro archivo tocado (`js/eventos.js` probablemente).
2. Con un usuario nuevo (o limpiando localStorage), confirmar que el modal de 5 pasos aparece con las ilustraciones nuevas visibles en cada paso.
3. Confirmar que el botón final navega correctamente: probar con las 3 cuentas demo y verificar que cada una termina en el módulo correcto (usuario→Recomendador, vendedor→Comparador, owner→sin redirección forzada o a Inicio).
4. Confirmar que al entrar por primera vez a Catálogo/Recomendador/Comparador/Capacitaciones aparece el tip contextual correspondiente, se puede cerrar, y no vuelve a aparecer en visitas posteriores del mismo usuario.
5. Confirmar que "Ver bienvenida nuevamente" desde Home sigue reabriendo el modal completo sin errores.
6. Responsive: confirmar que las ilustraciones y los tips contextuales no rompen en mobile (375px) — mismo chequeo de overflow horizontal que se viene haciendo en runs anteriores.
7. Consola sin errores en todo el recorrido.

## Qué reportar al terminar

- Qué enfoque se usó para las ilustraciones (SVG inline vs. CSS puro) y por qué.
- Dónde quedó implementado el hook de disparo de los tips contextuales.
- Confirmación de los 7 puntos de validación.
