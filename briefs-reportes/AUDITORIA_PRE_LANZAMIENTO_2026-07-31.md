# Auditoría pre-lanzamiento — Portal Bullpadel 2026

Fecha: 31/07/2026  
Horizonte informado: lanzamiento en 15 días

## Dictamen ejecutivo

El portal es una beta funcional y visualmente avanzada, pero **no está listo para publicarse como portal privado multiusuario**. Su catálogo y módulos comerciales pueden lanzarse; su autenticación y administración actuales no.

La causa principal es arquitectónica: el proyecto es una aplicación estática. Usuarios, contraseñas, sesión, permisos y progreso se guardan o validan en el navegador. Cualquier visitante que reciba los archivos obtiene también las credenciales demo y puede modificar su rol, usuarios y sesión desde las herramientas del navegador. Además, cada dispositivo mantiene una base de usuarios distinta.

Recomendación: mantener el frontend actual y agregar un backend gestionado para autenticación, perfiles, roles y progreso. Para el plazo disponible conviene evitar construir autenticación propia.

## Estado verificado

- Aplicación HTML/CSS/JavaScript sin framework ni proceso de build.
- 15 módulos JavaScript; todos pasan validación de sintaxis.
- 37 palas sin IDs duplicados y con todas sus imágenes presentes.
- 22 modelos competidores con todas sus imágenes presentes.
- 14 materiales, 20 tecnologías, 4 módulos de capacitación y 29 accesos de Media Center.
- No hay IDs HTML duplicados.
- El repositorio no contiene suite de pruebas, CI/CD, configuración productiva, observabilidad ni documentación de recuperación.
- El intento de prueba automatizada en navegador quedó limitado por el entorno local del navegador/servidor; no sustituye una pasada manual previa al lanzamiento.

## Hallazgos críticos — bloquean el lanzamiento privado

### P0. Autenticación completamente del lado cliente

Las tres contraseñas iniciales están en texto plano dentro de `js/data.js`. El login compara la contraseña en el navegador (`js/auth.js`) y la lista completa de usuarios, incluidas sus claves, queda en `localStorage`.

Impacto: no existe una frontera de seguridad. Ocultar botones no protege información ni operaciones. Un usuario puede inspeccionar el código, leer claves, alterar su rol o fabricar una sesión.

Acción: sustituir este sistema por autenticación del servidor, contraseñas hasheadas administradas por un proveedor, cookies seguras o tokens correctamente validados y autorización en cada operación del backend. Eliminar las credenciales demo del bundle público y rotarlas.

### P0. Administración y permisos sin autoridad central

Crear, editar, desactivar, borrar usuarios y cambiar contraseñas son operaciones locales. Los guards de `admin.js`, `auth.js` y `mapa-competitivo.js` son útiles para UX, pero no son controles de seguridad porque el cliente controla tanto los datos como el código.

Impacto: los cambios no se comparten entre dispositivos y son manipulables. Un owner no administra realmente una organización; administra el almacenamiento de su navegador.

Acción: implementar tablas de usuarios/perfiles/organizaciones, políticas de autorización en servidor y auditoría de operaciones administrativas.

### P0. Persistencia no multiusuario y sin recuperación

Usuarios, onboarding, checklist, quizzes y progreso viven en `localStorage`. Borrar datos del navegador, usar otro equipo o cambiar de navegador elimina el estado. No existen backups ni migraciones.

Acción: guardar progreso y configuración en base de datos; conservar `localStorage` solo como caché o soporte transitorio. Definir backup y restauración antes del lanzamiento.

## Hallazgos altos

### P1. Sin protección operativa de acceso

No hay recuperación de contraseña, expiración real de sesión, revocación central, límite de intentos, bloqueo temporal, MFA opcional, registro de accesos ni política de contraseñas adecuada. El mínimo actual es seis caracteres.

### P1. Sin pruebas automatizadas ni control de regresiones

No hay pruebas unitarias para el recomendador, pools por nivel, equivalencias o permisos; tampoco pruebas de flujo para login, navegación, administración y persistencia. Son reglas de negocio suficientemente complejas como para que una modificación pequeña genere regresiones silenciosas.

Cobertura mínima requerida:

- scoring y pools del recomendador, incluida la garantía PROLINE;
- permisos de los tres roles;
- alta, edición, baja lógica y revocación de usuarios;
- catálogo, filtros, ficha, comparación y mapa competitivo;
- progreso de capacitación por usuario;
- mobile 375 px y desktop;
- enlaces externos y recursos faltantes.

### P1. Sin proceso de despliegue reproducible

No hay entorno staging, pipeline, variables de entorno, health check, versionado visible, rollback documentado ni configuración de headers de producción. El servidor Python incluido es solo para desarrollo.

Acción: crear staging y producción separados, despliegue automático desde una rama protegida, smoke test posterior y rollback a la versión anterior.

### P1. Sin headers y políticas de seguridad definidos

El HTML no define Content Security Policy ni hay configuración visible para HSTS, `X-Content-Type-Options`, `frame-ancestors`, `Permissions-Policy` o una política completa de referrer. Los handlers inline dificultan adoptar una CSP estricta.

Acción: mover eventos inline a listeners, definir CSP compatible con YouTube/Drive e imágenes, y configurar headers en el proveedor de hosting.

### P1. Riesgo de inyección y fragilidad por HTML dinámico

El proyecto usa `innerHTML` extensamente. Parte de los datos administrativos se escapa, pero múltiples datasets y URLs se interpolan directamente. Hoy muchos datos están controlados por el repositorio; cuando migren a backend o sean editables, la superficie se vuelve relevante.

Acción: centralizar escape/sanitización, validar URLs por protocolo y dominio cuando corresponda, y usar `textContent`/DOM APIs para campos dinámicos.

## Hallazgos medios

### P2. Arquitectura global difícil de mantener

Todos los módulos comparten variables y funciones globales y dependen del orden de 15 etiquetas `<script>`. No hay encapsulación, tipos, contrato de datos ni detección automática de dependencias circulares.

Acción posterior al lanzamiento: migrar gradualmente a módulos ES, agregar lint/formatter y contratos con TypeScript o validación de esquemas. No conviene reescribir todo antes de lanzar.

### P2. Archivo de datos grande y actualización manual

`js/data.js` supera las 2.400 líneas y mezcla catálogo, usuarios, permisos, formación, competencia y Media Center. Esto aumenta conflictos y hace difícil validar cambios de contenido.

Acción: separar datasets por dominio, validar esquemas y generar los archivos derivados desde fuentes versionadas. Los usuarios deben salir por completo del frontend.

### P2. Deuda y duplicación conocida

`adminDelete` y `togglePwdVisibility` aparecen duplicadas en `js/admin.js`. No rompe hoy porque gana la última declaración, pero puede producir correcciones aplicadas a la copia equivocada. También hay textos menores a corregir, por ejemplo “¿Eliminár...?”.

### P2. Accesibilidad incompleta

Hay muchas interacciones implementadas con `div onclick`, modales sin semántica de diálogo/foco, controles sin estado ARIA y navegación dependiente del mouse. Esto afecta teclado, lectores de pantalla y calidad móvil.

Acción: botones reales, foco atrapado/restaurado en modales, Escape consistente, labels, `aria-expanded` y contraste verificado.

### P2. Rendimiento y caché

Los datos y todo el código se descargan al inicio; `data.js` ronda 179 KB y CSS ronda 126 KB sin minificación. El servidor de desarrollo desactiva caché. Para producción faltan compresión, hashes/versionado de assets y una política de caché diferenciada.

### P2. Datos competitivos pendientes

Las 22 equivalencias siguen sin validación comercial y 11 niveles están incompletos según el contexto del proyecto. No es un bug técnico, pero sí riesgo reputacional para un portal de vendedores.

Acción: obtener aprobación comercial explícita o marcar el módulo como beta/no validado y restringirlo hasta completar la revisión.

## Backend mínimo recomendado

Para 15 días, usar un servicio gestionado como Supabase o Firebase, o un backend pequeño desplegado en una plataforma administrada. La opción más directa para este portal es:

- autenticación gestionada por email y contraseña;
- tabla `profiles`: usuario, nombre, rol, organización/distribuidor, estado;
- tabla `training_progress`: usuario, módulo/unidad, checklist, quiz, fecha;
- tabla `audit_log`: actor, acción, objetivo, fecha y metadatos mínimos;
- políticas por fila/rol en la base;
- funciones protegidas para invitar, desactivar y cambiar roles;
- catálogo inicialmente estático y versionado para reducir alcance;
- almacenamiento de medios actual en Drive durante esta primera salida.

No hace falta migrar catálogo, recomendador ni Media Center al backend para el primer lanzamiento. El corte correcto es identidad, administración y progreso.

## Plan de 15 días

### Días 1–2 — decisiones y base

- elegir hosting, backend gestionado, dominio y responsables;
- congelar alcance funcional;
- crear staging y producción;
- diseñar tablas, roles y políticas;
- definir criterios de “go/no-go”.

### Días 3–6 — identidad y administración

- integrar login real y cierre de sesión;
- migrar roles/perfiles;
- reemplazar CRUD local por operaciones protegidas;
- implementar invitación o alta controlada y recuperación de contraseña;
- retirar contraseñas y usuarios del frontend.

### Días 7–8 — progreso y migración

- persistir capacitación/onboarding;
- decidir si el estado local beta se descarta o se migra;
- agregar auditoría y manejo consistente de errores/carga.

### Días 9–11 — pruebas y hardening

- pruebas unitarias de reglas comerciales;
- pruebas end-to-end de los tres roles;
- CSP y headers;
- rate limit, expiración/revocación y validación de inputs;
- revisión de accesibilidad y mobile.

### Días 12–13 — ensayo de producción

- carga de usuarios piloto;
- prueba con datos y dispositivos reales;
- verificación visual de enlaces Drive/YouTube;
- backup, restauración y rollback ensayados.

### Día 14 — congelamiento

- solo correcciones bloqueantes;
- aprobación comercial del contenido;
- checklist final y responsables de soporte.

### Día 15 — lanzamiento controlado

- despliegue gradual a un grupo pequeño;
- monitoreo de errores, login y uso;
- ampliación solo si no aparecen incidentes críticos.

## Criterios de go/no-go

No lanzar como portal privado si cualquiera de estos puntos sigue abierto:

- contraseñas o autorización dependen del navegador;
- un usuario puede elevar su rol modificando datos locales;
- altas/bajas no se reflejan en todos los dispositivos;
- no existe revocación ni recuperación de acceso;
- no hay staging, rollback y backup probado;
- los tres roles no pasan la prueba completa en desktop y móvil;
- no hay responsable operativo para incidentes del lanzamiento.

## Qué conservar

La mayor parte del trabajo visual y comercial es reutilizable. Conviene conservar el frontend, la estructura modular actual, catálogo, recomendador, comparador, capacitaciones y Media Center. La estrategia de menor riesgo es reemplazar la capa ficticia de identidad/persistencia, sumar pruebas y endurecer el despliegue, sin iniciar una reescritura general.

---

## Validación funcional — Supabase Auth y Administración Fase 2 (04/08/2026)

Actualización sobre el dictamen del 31/07/2026: los P0 de "Autenticación completamente del lado cliente" y "Administración y permisos sin autoridad central" descritos arriba corresponden al estado previo a Supabase Auth (Fase 1, commit `cc5eaec`) y a la Administración segura (Fase 2, commit `a0b445f`). Con ambas fases desplegadas y esta ronda de pruebas funcionales completada, esos dos hallazgos quedan **resueltos** para la capa de identidad/administración — no se los borra de este documento por trazabilidad histórica, pero ya no aplican al estado actual del portal.

Ejecutado por Leandro Soto (owner) guiado por Claude Code, contra el proyecto Supabase `zzvdrnwotxrgvncbsaez`, usando exclusivamente cuentas y organizaciones de prueba reales (sin datos ficticios ni mutaciones directas por SQL).

### Resumen — Bloques 1 a 6

| Bloque | Resultado |
|---|---|
| 1. Invitación y alta de vendedor | **PASS** — flujo completo: invitar → email recibido → link en incógnita → "Configurá tu contraseña" → logout forzado → login normal → rol/nav correctos |
| 2. Asignación de organizaciones | **PASS** — `assign_seller` funcional, auditado como `organization.seller_assigned` |
| 3. Invitación de credencial mayorista | **PASS** — desde owner y desde vendedor asignado; regla de una sola credencial `usuario` activa por organización respetada; activar/desactivar desde alcance de vendedor OK |
| 4. Permisos por rol (cliente + servidor) | **PASS** — capa de UI escopada correctamente para vendedor (sin "Nueva organización", sin Auditoría, organizaciones limitadas a las asignadas); **capa de servidor confirmada por bypass deliberado de la UI vía consola** — `invite_user` con `role:'vendedor'` desde sesión vendedor devuelve `403 forbidden` real |
| 5. Recuperación de contraseña | **PASS** — alcance correcto (403 fuera de alcance vía bypass de consola), auditado como `user.password_reset_requested` |
| 6. Políticas y auditoría | **PASS** — todos los eventos esperados presentes; lectura de `audit_logs` como no-owner bloqueada por RLS (`data: []` sin error, confirmado desde consola como vendedor) |

### Bloque 7 — Casos de borde (evidencia completa)

Ejecutado con las cuentas y organizaciones de prueba ya existentes (vendedor + `PRUEBA CODEX editada` + credencial mayorista), sin modificar código, migraciones ni configuración.

| # | Caso | Resultado esperado | Resultado real | HTTP/código | Estado final de los registros | PASS/FAIL |
|---|---|---|---|---|---|---|
| 1 | Desactivar vendedor con organización asignada | Rechazo, sin mutación | Rechazado | 409 `seller_still_assigned` | Vendedor activo; `PRUEBA CODEX editada` conserva el vendedor asignado — sin mutación parcial | **PASS** |
| 2 | Cascada al desactivar la organización | Org inactiva → credencial `usuario` inactiva automáticamente; sesión existente pierde acceso al recargar; login posterior rechazado | Confirmado en los 4 puntos | Cascada vía trigger DB (sin código HTTP propio); login rechazado con "Tu usuario se encuentra inactivo. Contactá al equipo Bullpadel." | Org inactiva; credencial `usuario` inactiva; sesión de incógnito expulsada al recargar | **PASS** |
| 3 | Reactivación asimétrica | Reactivar org NO reactiva la credencial; login sigue rechazado hasta activación explícita; luego login permitido | Confirmado en los 3 puntos | Login rechazado (mismo mensaje) hasta activación manual; luego login OK | Org activa; credencial `usuario` activada explícitamente y con acceso | **PASS** |
| 4 | Desactivación válida de vendedor (sin organizaciones asignadas) | Desasignar → desactivar permitido → reactivar → reasignar | Confirmado en los 4 pasos | 200 en la desactivación (vs. 409 del Caso 1) | Organización activa y con vendedor asignado; vendedor activo y asignado; credencial mayorista activa | **PASS** |
| 5 | Último owner — auto-modificación | Rechazo por intento de cambiar el propio estado | Rechazado | 403 `forbidden` ("No podés cambiar el estado de tu propia cuenta.") | Sin cambios — owner sigue activo | **PASS** |
| — | Guard concurrente de último owner (`pg_advisory_xact_lock`, migración 002) | — | **No ejecutado** — validado solo por inspección de código (`prevent_last_owner_removal()`, líneas 69-99 de `202608030002_admin_backend.sql`), por decisión explícita de no correr una prueba destructiva ni crear un segundo owner | — | Sin cambios | No ejecutado (por diseño) |

**Resultado global del bloque 7: 5/5 casos ejecutados, 5/5 PASS.**

### Distinciones explícitas

- **5/5 casos del bloque 7 ejecutados con PASS.** Ningún hallazgo nuevo de seguridad o integridad — los triggers de la migración `202608030002` se comportan exactamente como documenta `SETUP.md` sección 4.8, incluida la asimetría deliberada de la reactivación de organización.
- El **guard concurrente del último owner** (serialización vía `pg_advisory_xact_lock` para evitar que dos degradaciones simultáneas dejen el portal sin owners activos) está **validado solamente por inspección de código**, no por ejecución real — se descartó una prueba de concurrencia real porque hubiera requerido crear un segundo owner o mutar la base directamente por SQL, fuera del alcance autorizado para esta ronda.
- La **auditoría (`audit_logs`) es best-effort, no transaccional** con la mutación de negocio (documentado en `SETUP.md` sección 4.8): en todos los casos probados los eventos esperados aparecieron, pero esto no es una garantía estructural — si el insert de auditoría fallara, la operación de negocio igual queda aplicada. No se encontró ningún evento faltante durante esta ronda, pero la ausencia de garantía transaccional sigue siendo una característica conocida del diseño, no un hallazgo nuevo.

### Hallazgos de esta ronda (detalle completo en `briefs-reportes/REPORTE_pruebas_funcionales_fase2_administracion_2026-08-04.md`)

- 🔴 Bloqueante: sin SMTP propio configurado (resuelto parcialmente con Brevo durante la sesión).
- 🔴 Bloqueante: entregabilidad — los emails caen en Spam por falta de autenticación de dominio (SPF/DKIM/DMARC) completa en `bullpadelargentina.com.ar`.
- 🔴 Bloqueante: la casilla `info@bullpadelargentina.com.ar` no recibió el mail de verificación de sender — pendiente de revisión en el hosting de Ferozo.
- 🟠 Medio: `admin-portal/index.ts:531-538` colapsa cualquier error de `inviteUserByEmail` a un 500 genérico, sin distinguir causa ni loguear el detalle completo. **Corrección de código aplicada 04/08/2026** (`classifyInviteError()`), verificada con 14 casos simulados — sin desplegar, sin prueba real.
- 🟠 Medio: `js/auth.js:385-389` muestra siempre el mismo mensaje genérico ante cualquier error de `updateUser({password})`, incluido el caso real reproducido de "contraseña igual a la anterior". **Corrección de código aplicada 04/08/2026** (`_setPasswordErrorMessage()`), verificada con 10 casos simulados contra el archivo real — sin prueba real end-to-end.
- 🟡 Menor: no quedaba claro con qué email loguearse después de configurar la contraseña. **Corrección de código aplicada 04/08/2026** (email mostrado en pantalla + precarga en login), verificada visualmente en navegador — sin prueba real end-to-end.

### Criterio go/no-go — actualizado

- **Aplicación, roles, RLS, triggers e integridad de datos: GO.** Los 6 bloques funcionales y los 5 casos de borde del bloque 7 pasaron sin hallazgos de seguridad ni de integridad, incluidos los intentos deliberados de bypass de la UI.
- **Lanzamiento general del portal: NO-GO**, exclusivamente por infraestructura de mailing sin terminar.

**Pendientes bloqueantes:**
1. Completar SPF/DKIM/DMARC para `bullpadelargentina.com.ar` (quedó un registro DKIM2 mal cargado en Ferozo, con nombre/contenido cruzados con el TXT de verificación).
2. Confirmar entregabilidad fuera de Spam una vez propagados los registros DNS.
3. Revisar la recepción de `info@bullpadelargentina.com.ar` (o la casilla que se defina como remitente) en el hosting de Ferozo.

**Pendientes medios (recomendados antes de lanzar, no bloqueantes) — código corregido 04/08/2026, sin desplegar ni probar en real:**
1. ~~Clasificar y loguear correctamente los errores de invitación~~ — implementado, pendiente desplegar `admin-portal` y confirmar contra un error real.
2. ~~Mostrar el motivo real en los mensajes de error al configurar contraseña~~ — implementado en `js/auth.js`, pendiente prueba real.
3. ~~Aclarar en el flujo de invitación con qué email debe iniciar sesión la persona invitada~~ — implementado (pantalla + precarga de login), pendiente prueba real.
