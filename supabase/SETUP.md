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

## 4. No crear aún vendedores o distribuidores

Las altas siguientes se implementarán mediante una función administrativa segura. No deben hacerse desde el frontend ni utilizando una clave secreta en el navegador.

## Modelo adoptado

- `owner`: administración general.
- `vendedor`: personal Bullpadel; puede tener mayoristas asignados.
- `usuario`: una credencial compartida por cada cliente mayorista.
- el progreso pertenece a la credencial que inició sesión;
- en v1 no se muestra progreso de terceros;
- las bajas son lógicas (`inactivo`) y conservan el historial.
