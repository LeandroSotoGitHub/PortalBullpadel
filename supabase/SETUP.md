# Instalación inicial de Supabase

## 1. Ejecutar la migración

1. Abrir el proyecto de Supabase.
2. Ir a **SQL Editor**.
3. Crear una consulta nueva.
4. Copiar el contenido completo de `migrations/202608030001_initial_portal_schema.sql`.
5. Ejecutar con **Run**.
6. Confirmar que finaliza sin errores.

La migración crea tablas, índices, trigger de perfil, matriz de permisos y políticas RLS.

## 2. Configurar Auth como portal cerrado

En la configuración de Authentication:

- mantener habilitado Email/Password;
- deshabilitar el registro público de nuevos usuarios;
- no crear usuarios hasta terminar el paso 1;
- configurar más adelante las URLs de redirección de GitHub Pages y producción.

## 3. Crear el primer owner

Después de ejecutar la migración:

1. Ir a **Authentication > Users**.
2. Crear el usuario owner desde el panel, con su email real y una contraseña temporal fuerte.
3. Volver a **SQL Editor** y ejecutar, reemplazando el email:

```sql
update public.profiles
set
  role = 'owner',
  status = 'activo',
  display_name = 'Nombre del owner'
where id = (
  select id from auth.users where lower(email) = lower('EMAIL_DEL_OWNER')
);
```

4. Verificar:

```sql
select id, email, display_name, role, status
from public.profiles;
```

Debe existir una fila con `role = owner` y `status = activo`.

## 4. Fase 2 — Administración segura (organizaciones y cuentas)

Las altas de vendedores/mayoristas ya NO se hacen a mano por SQL editor — se hacen desde el panel Administración del portal (owner/vendedor), que llama a la Edge Function `admin-portal`. Pasos para dejarla operativa:

### 4.1 Ejecutar la migración de Fase 2

1. Abrir **SQL Editor** en el proyecto de Supabase.
2. Copiar el contenido completo de `migrations/202608030002_admin_backend.sql`.
3. Ejecutar con **Run** y confirmar que finaliza sin errores.
4. Copiar y ejecutar también `migrations/202608040001_grant_admin_service_permissions.sql` (ver 4.1.1 — sin esta, el panel de Administración carga pero cualquier escritura falla con "permission denied").
5. Copiar y ejecutar `migrations/202608180001_guarded_permanent_deletion.sql` para habilitar la eliminación permanente protegida (ver 4.8).
6. Copiar y ejecutar `migrations/202608180002_automatic_organization_codes.sql` para que los códigos se asignen correlativamente desde la base.
7. No volver a ejecutar `202608030001_initial_portal_schema.sql` — esa migración ya corrió y no se modifica.

Esta migración agrega: un constraint (`owner`/`vendedor` nunca tienen `organization_id`), índices para los listados de Administración, la policy de lectura de `audit_logs` para `owner`, cinco triggers de defensa en profundidad (protección del último owner activo con lock de concurrencia — ver 4.8; un vendedor asignado siempre debe ser vendedor activo; desactivar una organización desactiva en cascada a su credencial `usuario`; un vendedor con organizaciones asignadas no puede desactivarse, serializado contra la asignación — ver 4.8; y una credencial `usuario` no puede quedar activa si su organización no existe o está inactiva — ver 4.8) y una función auxiliar de locking (`lock_seller_guard`, no es un trigger — la usan dos de los triggers de arriba). No abre ninguna escritura directa desde el navegador — todas las escrituras privilegiadas pasan por la Edge Function.

### 4.1.1 Por qué hace falta una migración aparte para `service_role`

`ctx.supabaseAdmin` en la Edge Function usa la `service_role` key, que **bypassa RLS** — pero bypassar RLS no bypassa los privilegios SQL estándar de Postgres. `service_role` sigue siendo un rol de base de datos normal: si nadie le hizo `GRANT` sobre una tabla, no puede leerla ni escribirla, con o sin RLS. Las migraciones 001 y 002 solo otorgaron privilegios a `authenticated` (para las lecturas RLS-scoped que hace el frontend directamente) — nunca a `service_role`, porque hasta la primera prueba funcional real del panel no se había ejercitado ese camino.

`202608040001_grant_admin_service_permissions.sql` corrige esto otorgando **solo** los privilegios mínimos que el código de `admin-portal/index.ts` efectivamente usa (verificado línea por línea antes de escribirla): `SELECT/INSERT/UPDATE` en `organizations`, `SELECT/UPDATE` en `profiles`, `INSERT` en `audit_logs` — nunca `DELETE` en ninguna, nunca `INSERT` en `profiles` (el alta inicial la hace el trigger `handle_new_auth_user`), nunca lectura/escritura de `audit_logs` más allá del insert, y nada para `anon`.

La eliminación permanente tampoco agrega `DELETE` directo a `service_role`: `202608180001_guarded_permanent_deletion.sql` expone únicamente una RPC privada `SECURITY DEFINER` para borrar organizaciones vacías y agrega un trigger que protege las cuentas. `anon` y `authenticated` no pueden ejecutar esa RPC.

### 4.2 Configurar `PORTAL_BASE_URL` (secreto de la Edge Function)

La función usa esta variable para el `redirectTo` de invitaciones y recuperación de contraseña — **nunca** acepta una URL enviada por el navegador. Con el Supabase CLI ya autenticado y el proyecto enlazado (`supabase link --project-ref zzvdrnwotxrgvncbsaez`):

```bash
supabase secrets set PORTAL_BASE_URL=https://tu-usuario.github.io/PortalBullpadel/
```

Valores de ejemplo según dónde se esté sirviendo el portal (usar el que corresponda, sin barra final duplicada):

| Entorno | Valor de ejemplo |
|---|---|
| GitHub Pages actual | `https://leandrosotogithub.github.io/PortalBullpadel/` (ajustar al usuario/repo reales del Pages activo) |
| Desarrollo local | `http://localhost:8531/` (o el puerto que use `scripts/nocache-server.py` en ese momento) |
| Futuro dominio productivo | *(todavía no existe — configurar cuando se defina; no hardcodear acá)* |

No hace falta configurar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS` ni `SUPABASE_JWKS` — el runtime de Edge Functions los inyecta automáticamente.

### 4.3 Configurar Redirect URLs en Supabase Auth

**Authentication → URL Configuration → Redirect URLs** — agregar exactamente las mismas URLs que se usen como `PORTAL_BASE_URL` (Supabase rechaza cualquier `redirectTo` que no esté en esta lista, sin importar lo que envíe la Edge Function):

- `http://localhost:8531/*` (ajustar el puerto si corresponde)
- La URL de GitHub Pages activa (con `/*` al final)
- El futuro dominio productivo, cuando exista

### 4.4 Desplegar la Edge Function

```bash
supabase functions deploy admin-portal
```

`verify_jwt = true` ya queda configurado por `supabase/config.toml` — no hace falta pasar flags adicionales. Si el CLI reporta un error de TypeScript al desplegar, revisar `supabase/functions/admin-portal/index.ts` (este repo no tiene Deno instalado localmente para chequear antes del deploy — `deno check supabase/functions/admin-portal/index.ts` es la validación previa recomendada si tenés Deno disponible).

### 4.5 Probar con la cuenta owner

1. Recargar el portal e iniciar sesión como owner.
2. Entrar a **Administración** — debería verse el resumen, la tabla de organizaciones (vacía al principio), el formulario de invitación y la auditoría.
3. Crear una organización de prueba ("Nueva organización").
4. Invitar un vendedor (rol Vendedor, sin organización) — llega un email de invitación a esa casilla.
5. Revisar **Auditoría** — debería aparecer `organization.created` y `user.invited`.

### 4.6 Crear el primer vendedor

Desde Administración (owner): "Invitar cuenta" → rol **Vendedor** → nombre + email. La persona invitada recibe el email, abre el link, configura su contraseña en el portal (pantalla "Configurá tu contraseña") y ya puede iniciar sesión. Después, desde la tabla de **Organizaciones**, asignarle una organización con el botón "Vendedor".

### 4.7 Crear el primer mayorista (organización + credencial `usuario`)

1. Owner crea la organización (o ya existe una creada).
2. Owner o el vendedor asignado a esa organización usa "Invitar cuenta" → rol **Usuario / Distribuidor** → elegir la organización.
3. La persona invitada configura su contraseña por el mismo flujo del punto 4.6.
4. Solo puede existir una credencial `usuario` **activa** por organización — si ya hay una, la invitación devuelve un conflicto claro en vez de crear una segunda.

### 4.8 Comportamientos importantes y deuda técnica conocida

**Desactivar una organización desactiva a su credencial `usuario` (cascada atómica).** Cuando `update_organization` pasa una organización de cualquier estado a `inactivo`, un trigger (`organizations_cascade_deactivate_users`, en la misma migración) desactiva automáticamente todos los perfiles `role='usuario'` de esa organización, en la misma transacción del `UPDATE` — si el trigger falla, todo el `UPDATE` se revierte, no queda la organización inactiva con su usuario todavía activo. **Es asimétrico a propósito:** reactivar la organización (`activo` de nuevo) **no** reactiva a sus usuarios — reactivar una cuenta puntual siempre requiere `set_account_status` explícito desde Administración. Motivo: una organización se reactiva por una decisión comercial, pero quién queda habilitado para loguearse es una decisión de cuenta aparte (podría no ser la misma persona/credencial).

**Un vendedor con organizaciones asignadas no se puede desactivar.** `set_account_status` responde `409 seller_still_assigned` si se intenta desactivar un vendedor activo que todavía tiene organizaciones con `assigned_seller_id` apuntando a él — hay que reasignarlas o desasignarlas primero (no se hace automáticamente). Reforzado también por un trigger de base (`profiles_prevent_deactivating_assigned_seller`) como red de seguridad.

**Una cuenta `usuario` nunca puede estar activa si su organización está inactiva (o no existe).** Cubre el hueco que dejaba la cascada de desactivación: esa cascada corre solo en el momento en que la organización pasa a inactiva, pero sin esta regla nada impedía reactivar esa misma credencial más tarde con `set_account_status` mientras la organización seguía inactiva. Aplicado en dos capas: la Edge Function rechaza con `409 organization_inactive` antes de escribir (aplica igual a owner y vendedor), y un trigger de base (`profiles_prevent_usuario_active_without_active_org`, `BEFORE INSERT OR UPDATE` en `profiles`) es la red de seguridad — exige organización no nula, existente y activa cada vez que un perfil `usuario` intenta quedar en `status='activo'`. No interfiere con la cascada: un perfil que pasa a `inactivo` nunca entra a esta validación.

**Asignar y desactivar vendedores se serializa para preservar la integridad bajo concurrencia.** Sin coordinación, "asignar la organización X al vendedor V" y "desactivar a V" son transacciones independientes que cada una puede leer el estado "de antes" de la otra y ambas terminar aplicándose — el resultado sería una organización asignada a un vendedor inactivo. `prevent_invalid_seller_assignment()` (al asignar) y `prevent_deactivating_assigned_seller()` (al desactivar) ahora toman el mismo `pg_advisory_xact_lock`, derivado establemente del UUID del vendedor (`lock_seller_guard(seller_id)`, namespace `720260` — no colisiona con el lock fijo `72026003` del guard de último owner), antes de validar. Así se serializan entre sí: la segunda transacción en llegar espera a que la primera haga commit o rollback, y valida contra el estado ya definitivo — exactamente una de las dos prevalece, la otra se rechaza (`409 invalid_seller` o `409 seller_still_assigned` según cuál pierda la carrera). Vendedores distintos usan claves distintas y no se bloquean entre sí.

**La eliminación permanente existe solo para owner y exige preparación previa.** Una cuenta debe estar inactiva; nunca se puede eliminar la cuenta propia ni ninguna cuenta `owner`, y un vendedor debe quedar sin organizaciones asignadas. El borrado en Supabase Auth elimina también perfil, progreso y preferencias por las cascadas del esquema. Una organización debe estar inactiva, sin vendedor asignado y sin ninguna cuenta vinculada. La interfaz exige dos confirmaciones (incluido escribir `ELIMINAR`), la Edge Function revalida todo y la migración `202608180001` repite las reglas críticas dentro de PostgreSQL. Los eventos exitosos quedan como `user.deleted` u `organization.deleted` en auditoría best-effort.

**El código de organización es automático e inmutable desde Administración.** La migración `202608180002` inicializa una secuencia desde el mayor código numérico existente y asigna el siguiente al insertar (`001`, `002`, `003`...). La secuencia evita duplicados cuando dos organizaciones se crean al mismo tiempo. La Edge Function omite el código al crear e ignora cualquier `code` enviado por un frontend viejo al crear o editar; la interfaz solo lo muestra como lectura.

**Auditoría (`audit_logs`) es best-effort, no atómica con la mutación.** El insert de auditoría ocurre DESPUÉS de que la mutación de negocio (organización/perfil) ya hizo commit — si el insert de auditoría falla, la operación de negocio igual queda aplicada; el fallo solo se registra en los logs de la función (estructurado, sin datos sensibles), nunca bloquea ni revierte la respuesta al usuario. **Deuda técnica:** para que mutación + auditoría sean realmente atómicas habría que migrar estas acciones a funciones RPC de Postgres (`SECURITY DEFINER`) que hagan el `UPDATE`/`INSERT` de negocio y el `INSERT` en `audit_logs` en la misma transacción SQL. No implementado en esta run. El flujo de `invite_user` (combina Supabase Auth Admin con un `UPDATE` de `profiles`) nunca puede ser 100% transaccional porque Auth vive fuera de la base del proyecto — ya tiene su propia compensación (borra el usuario Auth si el `UPDATE` posterior falla), documentada en el propio código.

## Modelo adoptado

- `owner`: administra todas las organizaciones y cuentas; no conoce ni establece contraseñas de terceros.
- `vendedor`: personal Bullpadel; ve y opera solo las organizaciones que tiene asignadas (`organizations.assigned_seller_id`), nunca crea organizaciones ni otros vendedores.
- `usuario`: una credencial compartida por cada cliente mayorista — como máximo una activa por organización.
- el progreso pertenece a la credencial que inició sesión;
- en v1 no se muestra progreso de terceros;
- las bajas habituales son lógicas (`inactivo`) y conservan el historial; el owner puede hacer una eliminación permanente posterior, bajo las protecciones de 4.8;
- toda escritura privilegiada (crear/editar/eliminar organización, asignar vendedor, invitar, activar/desactivar/eliminar cuentas, recuperación de contraseña) pasa exclusivamente por la Edge Function `admin-portal` — nunca por el navegador directo ni por `supabase.auth.admin`.
