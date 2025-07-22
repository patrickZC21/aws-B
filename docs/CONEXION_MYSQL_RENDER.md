# Guía de Conexión MySQL en Render

## Problema: Error ECONNREFUSED ::1:3306

Si estás viendo el error `ECONNREFUSED ::1:3306` en tus logs de Render, significa que tu aplicación está intentando conectarse a una base de datos MySQL en `localhost` (::1 es la dirección IPv6 para localhost), pero no hay ningún servidor MySQL ejecutándose en el mismo servidor de Render.

## Solución

### 1. Configura las variables de entorno en el dashboard de Render

Debes configurar las siguientes variables de entorno en el dashboard de Render con los datos de tu servidor MySQL externo:

- `DB_HOST`: La dirección del servidor MySQL (NO uses 'localhost' o '127.0.0.1')
- `DB_PORT`: El puerto del servidor MySQL (normalmente 3306)
- `DB_USER`: El nombre de usuario para conectarse a MySQL
- `DB_PASSWORD`: La contraseña para conectarse a MySQL
- `DB_NAME`: El nombre de la base de datos
- `JWT_SECRET`: Tu clave secreta para JWT

### 2. Verifica la configuración SSL

Hemos habilitado la configuración SSL en el archivo `db.js` para permitir conexiones seguras a bases de datos remotas:

```javascript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
```

Esto es necesario para conectarse a la mayoría de los proveedores de bases de datos MySQL en la nube.

### 3. Proveedores recomendados de MySQL

Si aún no tienes un servidor MySQL, puedes usar alguno de estos proveedores:

- [PlanetScale](https://planetscale.com/) (tiene plan gratuito)
- [AWS RDS](https://aws.amazon.com/rds/mysql/)
- [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql)
- [Azure Database for MySQL](https://azure.microsoft.com/en-us/services/mysql/)
- [DigitalOcean Managed MySQL](https://www.digitalocean.com/products/managed-databases-mysql/)

### 4. Verificación de la conexión

Una vez configuradas las variables de entorno, puedes verificar la conexión accediendo a:

```
https://brayamsac-backend.onrender.com/ping-db
```

Esta ruta debería devolver `{"connected":true}` si la conexión es exitosa.

## Notas importantes

1. **NUNCA uses 'localhost' o '127.0.0.1'** como valor para `DB_HOST` en Render, ya que estos valores apuntan al propio servidor de Render, donde no hay ningún servidor MySQL instalado.

2. **Asegúrate de que tu servidor MySQL acepta conexiones remotas** desde los servidores de Render. Esto puede requerir configurar reglas de firewall o listas blancas de IP.

3. **La mayoría de los proveedores de MySQL en la nube requieren SSL** para las conexiones, por lo que hemos habilitado esta opción por defecto.

4. Si estás usando PlanetScale, asegúrate de usar la cadena de conexión correcta que incluye la configuración SSL adecuada.