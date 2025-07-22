# Guía de Conexión MySQL en Render con Alwaysdata

## Problema: Error ECONNREFUSED ::1:3306

Si estás viendo el error `ECONNREFUSED ::1:3306` en tus logs de Render, significa que tu aplicación está intentando conectarse a una base de datos MySQL en `localhost` (::1 es la dirección IPv6 para localhost), pero no hay ningún servidor MySQL ejecutándose en el mismo servidor de Render.

## Solución

### 1. Configura las variables de entorno en el dashboard de Render

Debes configurar las siguientes variables de entorno en el dashboard de Render con los datos de tu servidor MySQL de Alwaysdata:

- `DB_HOST`: `mysql-brayamsacasistencia.alwaysdata.net` (NO uses 'localhost' o '127.0.0.1')
- `DB_PORT`: `3306` (puerto estándar de MySQL)
- `DB_USER`: `417526_brayamsac` (tu usuario de Alwaysdata)
- `DB_PASSWORD`: Tu contraseña de Alwaysdata (visible en tu panel de control)
- `DB_NAME`: `brayamsacasistencia_control_asistencias` (nombre de tu base de datos)
- `JWT_SECRET`: Tu clave secreta para JWT

### 2. Verifica la configuración SSL

Hemos habilitado la configuración SSL en el archivo `db.js` para permitir conexiones seguras a bases de datos remotas:

```javascript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
```

Esto es necesario para conectarse a la mayoría de los proveedores de bases de datos MySQL en la nube.

### 3. Proveedor de MySQL: Alwaysdata

Estás utilizando [Alwaysdata](https://www.alwaysdata.com/) como proveedor de MySQL, que ofrece:

- Hosting de bases de datos MySQL
- Panel de administración phpMyAdmin
- Soporte para conexiones remotas
- Configuración SSL/TLS para conexiones seguras

Tu configuración actual en Alwaysdata es:
- Host: `mysql-brayamsacasistencia.alwaysdata.net`
- Base de datos: `brayamsacasistencia_control_asistencias`
- Usuario: `417526_brayamsac`
- Versión MySQL: 10.11 (MariaDB)

### 4. Verificación de la conexión

Una vez configuradas las variables de entorno, puedes verificar la conexión accediendo a:

```
https://brayamsac-backend.onrender.com/ping-db
```

Esta ruta debería devolver `{"connected":true}` si la conexión es exitosa.

## Notas importantes

1. **NUNCA uses 'localhost' o '127.0.0.1'** como valor para `DB_HOST` en Render, ya que estos valores apuntan al propio servidor de Render, donde no hay ningún servidor MySQL instalado.

2. **Asegúrate de que tu servidor MySQL en Alwaysdata acepta conexiones remotas** desde los servidores de Render. En Alwaysdata, esto se configura en la sección "Bases de datos > MySQL > Opciones" de tu panel de control.

3. **La opción SSL está habilitada por defecto** en nuestra configuración (`rejectUnauthorized: false`), lo que permite conexiones seguras a Alwaysdata.

4. **Verifica que la contraseña en el dashboard de Render coincida exactamente** con la contraseña de tu usuario de MySQL en Alwaysdata (`417526_brayamsac`).

5. **Si sigues teniendo problemas**, verifica en el panel de Alwaysdata que no haya restricciones de IP para las conexiones a tu base de datos.