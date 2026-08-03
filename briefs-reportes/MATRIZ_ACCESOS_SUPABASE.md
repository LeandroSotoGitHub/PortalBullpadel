# Matriz de accesos propuesta — Portal Bullpadel

Estado: aprobado para la primera versión del backend (03/08/2026).

## Roles

- **Owner:** administrador general del portal Bullpadel.
- **Vendedor:** personal interno/comercial Bullpadel que atiende mayoristas-distribuidores o trabaja en locales propios.
- **Usuario:** credencial compartida por un cliente mayorista-distribuidor.

## Leyenda

- **Sí:** acceso completo a esa función dentro del alcance indicado.
- **Propio:** solamente sus datos personales o su progreso.
- **Asignados:** solamente distribuidores y usuarios asignados al vendedor.
- **Lectura:** puede consultar, pero no modificar.
- **No:** sin acceso; el backend debe rechazar la operación aunque se intente manualmente.

## Módulos del portal

| Módulo / función | Owner | Vendedor | Usuario | Observación |
|---|---:|---:|---:|---|
| Inicio | Sí | Sí | Sí | Contenido adaptado al rol. |
| Catálogo de palas | Sí | Sí | Sí | Inicialmente estático. |
| Ficha técnica | Sí | Sí | Sí | Sin precio, stock, SKU o EAN Bullpadel. |
| Vista de gama completa | Sí | Sí | Sí | Solo consulta. |
| Materiales y tecnologías | Sí | Sí | Sí | Solo consulta. |
| Recomendador | Sí | Sí | Sí | Misma lógica comercial para los tres roles. |
| Comparador Bullpadel | Sí | Sí | Sí | Sin información sensible de usuarios. |
| Mapa competitivo | Sí | Sí | No | Información comercial interna. |
| Capacitaciones | Sí | Sí | Sí | Cada usuario conserva progreso propio. |
| Guía de venta | Sí | Sí | Sí | Se mantiene el comportamiento actual. |
| Media Center | Sí | Sí | Sí | Enlaces externos de Drive. |
| Administración | Sí | Limitada | No | El vendedor solo ve su alcance asignado. |
| Configuración global | Sí | No | No | No existe UI completa todavía. |

## Usuarios y acceso

| Acción | Owner | Vendedor | Usuario | Regla propuesta |
|---|---:|---:|---:|---|
| Ver su propio perfil | Sí | Sí | Sí | Todos pueden consultar su identidad y rol. |
| Editar su nombre | Propio | Propio | Propio | No permite cambiar rol, estado u organización. |
| Cambiar su email | Propio | Propio | Propio | Debe pasar por Supabase Auth y confirmación. |
| Cambiar su contraseña | Propio | Propio | Propio | Nadie conoce la contraseña anterior. |
| Recuperar contraseña | Sí | Sí | Sí | Enlace de recuperación por email. |
| Ver listado de usuarios | Todos | Asignados | No | No exponer usuarios de otros vendedores/distribuidores. |
| Invitar usuario distribuidor | Sí | Asignados | No | El vendedor solo invita usuarios dentro de su alcance. |
| Crear vendedor | Sí | No | No | Solo owner. |
| Crear owner | Sí | No | No | Recomendado: operación excepcional y auditada. |
| Editar perfil de otro usuario | Sí | Asignados | No | Campos comerciales; nunca contraseña. |
| Cambiar rol | Sí | No | No | Owner no puede quitarse su propio último rol owner. |
| Asignar distribuidor | Sí | Asignados | No | Vendedor solo dentro de sus asignaciones existentes. |
| Activar/desactivar usuario | Sí | Asignados | No | Desactivar conserva historial. |
| Enviar recuperación de contraseña | Sí | Asignados | No | Envía enlace; no establece ni revela la clave. |
| Eliminar definitivamente | No desde UI | No | No | Solo proceso técnico excepcional con auditoría. |
| Ver historial de acciones | Sí | No | No | Puede evaluarse una vista parcial para vendedores más adelante. |

## Distribuidores / organizaciones

| Acción | Owner | Vendedor | Usuario |
|---|---:|---:|---:|
| Ver distribuidores | Todos | Asignados | Propio |
| Crear distribuidor | Sí | No | No |
| Editar distribuidor | Sí | No | No |
| Asignar vendedor a distribuidor | Sí | No | No |
| Activar/desactivar distribuidor | Sí | No | No |
| Ver integrantes del distribuidor | Sí | Asignados | No por defecto |

## Progreso y preferencias

| Acción | Owner | Vendedor | Usuario | Regla propuesta |
|---|---:|---:|---:|---|
| Ver progreso propio | Propio | Propio | Propio | Acceso normal del portal. |
| Actualizar progreso propio | Propio | Propio | Propio | Cada usuario escribe solo sus filas. |
| Ver progreso de otros | No en v1 | No | No | Fuera del alcance inicial para evitar funcionalidad adicional. |
| Modificar progreso de otros | No | No | No | Evita manipular cumplimiento. |
| Ver preferencias/onboarding | Propio | Propio | Propio | No requiere acceso administrativo. |
| Actualizar preferencias/onboarding | Propio | Propio | Propio | Sustituye las claves actuales de localStorage. |

## Auditoría

| Acción | Owner | Vendedor | Usuario |
|---|---:|---:|---:|
| Generar eventos de auditoría | Automático | Automático | Automático |
| Consultar auditoría | Sí | No | No |
| Editar o eliminar auditoría | No | No | No |

Eventos mínimos a registrar:

- invitación y alta de usuario;
- cambio de rol;
- asignación de distribuidor o vendedor;
- activación/desactivación;
- solicitud de recuperación de contraseña;
- cambios de configuración;
- intentos administrativos rechazados.

## Reglas de seguridad que no dependen del rol

1. Ninguna contraseña se almacena en tablas públicas ni se envía al frontend.
2. La clave secreta de Supabase solamente puede existir en funciones de servidor.
3. Todas las tablas expuestas tienen RLS activado.
4. Un usuario anónimo no puede leer ninguna tabla privada.
5. Roles, estado y asignaciones no pueden modificarse desde el perfil propio.
6. Las bajas normales son lógicas (`activo = false`), no borrados físicos.
7. Las acciones administrativas sensibles pasan por una función de servidor y generan auditoría.
8. Los permisos se validan en Supabase aunque la interfaz oculte el botón.

## Decisiones de negocio confirmadas

1. **Vendedor** es personal Bullpadel, ya sea comercial que atiende distribuidores o personal de locales.
2. Cada cliente mayorista-distribuidor tendrá una única credencial compartida.
3. En la primera versión, ningún rol consulta el progreso de capacitación de terceros.
4. Guía de venta y Media Center siguen visibles para distribuidores.
5. El Mapa competitivo queda restringido a owner/vendedor.

Esta matriz es la fuente funcional para las tablas, funciones y políticas RLS de la primera versión.
