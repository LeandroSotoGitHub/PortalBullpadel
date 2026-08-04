# Reporte de pruebas funcionales — Administración segura (Fase 2)

Fecha: 04/08/2026
Alcance: validación end-to-end del backend de Administración desplegado en la run "Implement secure Supabase administration backend" (commit `a0b445f`), sobre el proyecto Supabase `zzvdrnwotxrgvncbsaez`.
Ejecutado por: Leandro Soto (owner), guiado por Claude Code. Codex como revisor/validador de la entrega.

## Dictamen ejecutivo

La arquitectura de Administración (roles, RLS, Edge Function `admin-portal`, triggers de defensa en profundidad, auditoría) **funciona correctamente en todos los casos probados**, incluidos los negativos y los intentos de bypass de la UI. El bloqueo real para lanzar no es de lógica de negocio ni de seguridad de datos — es de **infraestructura de mailing**, que quedó sin resolver del todo durante esta sesión.

**No-Go todavía**, con causa acotada y conocida: terminar la configuración de email antes de la siguiente ronda de pruebas.

## Estado verificado — funcional

| Bloque probado | Resultado |
|---|---|
| Invitación y alta de vendedor | OK — invitar → email recibido → link abierto en incógnita → pantalla "Configurá tu contraseña" → logout forzado → login normal → rol/nav correctos |
| Asignación de organización a vendedor (`assign_seller`) | OK — auditado como `organization.seller_assigned` |
| Invitación de credencial mayorista (`usuario`), desde owner y desde vendedor asignado | OK — regla de una sola credencial `usuario` activa por organización respetada |
| Activar/desactivar cuenta `usuario` desde el alcance del vendedor | OK |
| Permisos por rol — capa de UI (vendedor) | OK — sin botón "Nueva organización", sin tarjeta de Auditoría, selector de Rol oculto en Invitar cuenta, tabla de Organizaciones limitada a las asignadas |
| Permisos por rol — capa de servidor (bypass de UI vía consola) | OK — `invite_user` con `role:'vendedor'` desde sesión vendedor devuelve `403 forbidden` real, no solo botón oculto |
| Recuperación de contraseña (`send_password_reset`), owner y vendedor dentro de su alcance | OK — auditado como `user.password_reset_requested` |
| Recuperación de contraseña fuera de alcance (bypass de UI vía consola) | OK — `403 forbidden` |
| Lectura de `audit_logs` como no-owner (bypass de UI vía consola) | OK — RLS devuelve `data: []` sin error, ninguna fila visible |
| Asignar vendedor inexistente a una organización | OK — `404 not_found` |
| Asignar vendedor inactivo a una organización | OK — `400 invalid_seller`, la organización no se modifica |

## Hallazgos bloqueantes — infraestructura de mailing

### B1. No había SMTP propio configurado

El toggle "Enable custom SMTP" de Supabase Auth estaba apagado — el proyecto dependía del servicio de email por defecto de Supabase, pensado solo para pruebas puntuales (rate limit muy bajo, confirmado en logs: `email rate limit exceeded` tras 3-4 invitaciones seguidas).

**Resuelto parcialmente en esta sesión:** se configuró SMTP relay de Brevo (`smtp-relay.brevo.com:587`, 300 emails/día gratis) como proveedor. El envío ya funciona técnicamente.

### B2. Los emails llegan a Spam

Con Brevo configurado solo con un sender individual verificado (sin autenticación de dominio), Gmail/Outlook desconfían del remitente y lo mandan a Spam. Se empezó la autenticación completa del dominio `bullpadelargentina.com.ar` (SPF/DKIM/DMARC) en el panel de Ferozo, pero quedó **incompleta**:

- El registro DKIM2 (`brevo2._domainkey`, tipo CNAME, valor `b2.bullpadelargentina-com-ar.dkim.brevo.com`) se cargó mal — el campo "Nombre" y "Contenido" quedaron cruzados con los del registro TXT de verificación inicial.
- Los registros DNS, una vez bien cargados, tardan hasta 48hs en propagar — no se pudo verificar el resultado final en esta sesión.

**Acción pendiente:** corregir el registro DKIM2 en Ferozo, completar TXT + DKIM1 + DKIM2 + DMARC, esperar propagación, y volver a autenticar el dominio en Brevo.

### B3. La casilla `info@bullpadelargentina.com.ar` no recibe mail

Al intentar verificar esa dirección como sender en Brevo, el mail de confirmación nunca llegó (ni en spam). El dominio sí tiene registros MX (`mail.bullpadelargentina.com.ar`, `mx1.bullpadelargentina.com.ar`), por lo que el hosting de mail existe, pero la casilla puntual puede no estar provisionada.

**Acción pendiente:** confirmar en el panel de Ferozo que la casilla existe y está operativa (webmail, no solo la dirección "de nombre"); si no, crearla.

## Hallazgos de severidad media — no bloquean el flujo, pero engañan al usuario

### M1. Errores de invitación colapsados a un 500 genérico — corrección aplicada (04/08/2026), pendiente de despliegue y prueba real

`supabase/functions/admin-portal/index.ts:531-538` — cualquier falla de `inviteUserByEmail` (email con formato inválido, rate limit excedido, fallo de autenticación SMTP) devuelve siempre `fail(500, 'No se pudo enviar la invitación.', 'internal_error')`. Además, el log solo captura `inviteError?.message` (línea 536), que en el caso de fallo de conexión SMTP llegó vacío (`{}` en los logs) — obligó a buscar el detalle real en Auth Logs en vez de en el log de la función.

**Impacto:** un owner/vendedor no puede distinguir "email inválido" de "rate limit" de "SMTP mal configurado" solo mirando el portal.

**Acción sugerida:** mapear los errores conocidos de GoTrue a códigos HTTP específicos (400 para formato inválido, 429 para rate limit) y loguear el error completo, no solo `.message`.

**Corrección aplicada:** `classifyInviteError()` en `supabase/functions/admin-portal/index.ts` clasifica por `error.code`/`error.status` (contrato estable de Supabase Auth), con el texto de `.message` reservado solo como fallback para el caso de cuenta existente. Logging estructurado y seguro (`logInviteFailure()`) con solo `code`/`status`/`name`/`message` — nunca el email del invitado, `metadata`, tokens ni credenciales. Verificado con 14 casos de error simulados (14/14 OK) contra una copia funcional de la lógica, ya que no hay Deno disponible localmente para correr el archivo real. **Falta:** desplegar la función y confirmar el mapeo contra un error real de Supabase Auth (no solo simulado).

### M2. Error de cambio de contraseña con mensaje incorrecto — corrección aplicada (04/08/2026), pendiente de prueba real

`js/auth.js:385-389` — cualquier error de `supabaseClient.auth.updateUser({password})` se muestra siempre como *"No pudimos guardar la contraseña. Probá de nuevo en unos minutos."* Se reprodujo intentando reutilizar la misma contraseña anterior desde el link de recuperación: Supabase rechaza correctamente (error 422, "new password should be different"), pero el portal mostró el mensaje de rate limit en vez del motivo real.

**Acción sugerida:** mostrar el motivo específico cuando esté disponible (contraseña igual a la anterior, contraseña débil), reservar el mensaje genérico solo para errores realmente desconocidos.

**Corrección aplicada:** `_setPasswordErrorMessage()` en `js/auth.js` mapea `error.code`/`error.status` (`same_password`, `weak_password`, `session_not_found`/`bad_jwt`/`jwt_expired`/`otp_expired`, rate limit) a un mensaje específico; el mensaje genérico para causa desconocida ya no afirma que se resuelve "en unos minutos". Logging seguro con `_logSetPasswordError()` (solo `code`/`status`/`name`/`message`, nunca la contraseña ni valores del formulario). Verificado con 10 casos simulados ejecutados directamente contra el archivo real (10/10 OK, corrido con Node en un sandbox `vm`, sin DOM). **Falta:** prueba real reproduciendo el caso "misma contraseña que la anterior" contra Supabase Auth (ya se había reproducido una vez manualmente durante las pruebas del bloque 5, antes de esta corrección).

## Hallazgo menor — UX

### L1. No queda claro con qué email loguearse después de configurar la contraseña — corrección aplicada (04/08/2026), pendiente de prueba real

Tras invitar y crear la contraseña, no había ningún punto del flujo (ni el texto del mail, ni la pantalla "Configurá tu contraseña") que confirmara explícitamente "vas a iniciar sesión con este email".

**Corrección aplicada:** `_showPasswordSetupScreen()` en `js/auth.js` obtiene el email desde `data.session.user.email` (nunca de query params ni de nada enviado por el cliente) y lo muestra vía `textContent` en un nuevo elemento (`#pwdsetup-email`, `index.html` + `.pwdsetup-email` en `css/styles.css`) con el texto "Esta contraseña quedará asociada a: correo@dominio.com". Después de guardar la contraseña, el mensaje de éxito incluye el email y `handleSetPassword()` precarga el campo de email del login normal con ese mismo valor antes de mostrar la pantalla de login. Verificado visualmente en navegador (sin enviar ningún email real): render correcto del box de email y del mensaje de éxito con `getComputedStyle` confirmando `display:block`, sin errores de consola. **Falta:** prueba real de punta a punta con un link de invitación/recuperación real.

## Criterios go/no-go

**No-Go.** Orden recomendado para la siguiente ronda:

1. Corregir el registro DKIM2 en Ferozo y completar TXT + DKIM1 + DKIM2 + DMARC para `bullpadelargentina.com.ar`.
2. Confirmar/crear la casilla `info@bullpadelargentina.com.ar` (o la que se defina como remitente) en el hosting de Ferozo.
3. Esperar propagación DNS (hasta 48hs) y volver a autenticar el dominio en Brevo.
4. Repetir una ronda corta de los bloques 1 (alta de vendedor), 3 (invitación de credencial mayorista) y 5 (recuperación de contraseña) — los tres dependen de email — para confirmar que ahora llegan a bandeja principal, no a Spam.
5. ~~Recomendado antes de lanzar, no bloqueante: corregir M1 y M2~~ — **corrección de código aplicada (04/08/2026)** para M1, M2 y L1 (mensajes de error genéricos y aclaración del email de acceso), verificada con casos simulados pero **sin desplegar y sin prueba real** — pendiente confirmar contra la Edge Function desplegada y un flujo real de invitación/recuperación.
6. Confirmar `PORTAL_BASE_URL` y las Redirect URLs de Supabase Auth para el dominio productivo final (no solo `localhost`/GitHub Pages de prueba).

Una vez resueltos 1-4, el backend de Administración está, por lo probado hasta acá, listo para producción — no se encontraron fallas de seguridad, de aislamiento de roles ni de integridad de datos en ningún caso probado, incluidos los intentos deliberados de bypass.
