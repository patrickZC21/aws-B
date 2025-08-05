# 🚀 Guía de Despliegue en Render

## 📋 Requisitos Previos

- Cuenta en [Render](https://render.com)
- Repositorio de GitHub con el código del backend
- Base de datos MySQL (puede ser en PlanetScale, AWS RDS, o cualquier otro proveedor)

## 🔧 Configuración del Servicio en Render

### 1. Crear un Nuevo Servicio Web

1. Inicia sesión en tu cuenta de Render
2. Haz clic en "New" y selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio del backend

### 2. Configurar el Servicio

- **Nombre**: `brayamsac-backend` (o el nombre que prefieras)
- **Entorno**: `Node`
- **Plan**: Selecciona el plan que necesites (Free para pruebas)
- **Región**: Selecciona la región más cercana a tus usuarios
- **Rama**: `main` (o la rama que uses para producción)
- **Comando de Build**: `npm install`
- **Comando de Start**: `node src/index.js`

### 3. Variables de Entorno

Configura las siguientes variables de entorno en la sección "Environment Variables" de Render:

```
NODE_ENV=production
PORT=10000
DB_HOST=tu-host-de-base-de-datos
DB_PORT=3306
DB_USER=tu-usuario-de-base-de-datos
DB_PASSWORD=tu-contraseña-de-base-de-datos
DB_NAME=tu-nombre-de-base-de-datos
JWT_SECRET=tu-jwt-secret-muy-seguro
JWT_EXPIRES_IN=8h
FRONTEND_URL=https://brayamsac-frontend.vercel.app
MYSQL_CONNECTION_LIMIT=10
```

> ⚠️ **Importante**: No uses las opciones `acquireTimeout`, `timeout` o `reconnect` en la configuración de la base de datos, ya que generan warnings en Render con la versión actual de mysql2.

### 4. Configuración Avanzada (Opcional)

- **Auto-Deploy**: Activa esta opción si quieres que Render despliegue automáticamente cuando haya cambios en la rama seleccionada
- **Health Check Path**: `/health` (asegúrate de que esta ruta esté implementada en tu backend)

## 🔍 Verificación del Despliegue

1. Una vez desplegado, verifica que el servicio esté funcionando correctamente accediendo a la URL proporcionada por Render
2. Prueba la conexión a la base de datos accediendo a `/ping-db`
3. Verifica los logs en la sección "Logs" de Render para asegurarte de que no hay errores

## 🛠️ Solución de Problemas

### Error de Conexión a la Base de Datos

Si ves errores como `❌ Error de conexión:` en los logs, verifica:

1. Que las credenciales de la base de datos sean correctas
2. Que la base de datos esté accesible desde Render (algunos proveedores requieren configuración adicional)
3. Que el firewall de la base de datos permita conexiones desde Render

### Warnings de Configuración MySQL

Si ves warnings como:

```
Ignoring invalid configuration option passed to Connection: acquireTimeout
Ignoring invalid configuration option passed to Connection: timeout
Ignoring invalid configuration option passed to Connection: reconnect
```

Estos warnings se deben a opciones no compatibles con la versión actual de mysql2. Hemos actualizado el código para eliminar estas opciones, pero si sigues viendo estos warnings, verifica que estás usando la última versión del código.

## 📝 Notas Adicionales

- Render asigna automáticamente un nombre de dominio con el formato `https://tu-servicio.onrender.com`
- Para usar un dominio personalizado, configúralo en la sección "Settings" > "Custom Domain"
- Render usa Node.js 22.16.0 por defecto. Si necesitas una versión específica, configúrala en el archivo `.node-version` en la raíz de tu proyecto