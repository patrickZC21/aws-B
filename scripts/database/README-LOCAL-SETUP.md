# 🗄️ Configuración de Base de Datos Local

Esta guía te ayudará a configurar una base de datos MySQL local para el desarrollo del sistema de asistencias.

## 📋 Prerrequisitos

### 1. Instalar MySQL

**Windows:**
- Descargar MySQL Community Server desde [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Instalar MySQL Workbench (opcional pero recomendado)
- Durante la instalación, configurar el usuario `root` con contraseña vacía o recordar la contraseña

**Verificar instalación:**
```bash
mysql --version
```

### 2. Verificar que MySQL esté ejecutándose

**Windows:**
- Abrir "Servicios" (services.msc)
- Buscar "MySQL" y verificar que esté "En ejecución"
- Si no está ejecutándose, hacer clic derecho > "Iniciar"

## 🚀 Configuración Rápida

### Paso 1: Ejecutar el script de inicialización

```bash
# Desde la raíz del proyecto backend
cd brayamsac-backend-main
node scripts/database/init-local-database.js
```

### Paso 2: Configurar variables de entorno

```bash
# Copiar la configuración local
cp .env.local .env
```

O manualmente, actualizar tu archivo `.env` con:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=asistencia_db
```

### Paso 3: Reiniciar el servidor backend

```bash
npm run dev
```

## 📊 Estructura de la Base de Datos

El script crea las siguientes tablas:

- **roles**: Roles del sistema (Usuario, Administrador, Coordinador)
- **almacenes**: Almacenes principales
- **subalmacenes**: Subalmacenes por almacén
- **usuarios**: Usuarios del sistema
- **trabajadores**: Trabajadores por subalmacén
- **programacion_fechas**: Fechas programadas por subalmacén
- **asistencias**: Registro de asistencias
- **usuario_subalmacen_acceso**: Permisos de acceso
- **passwords_admin**: Contraseñas originales para admin

## 👥 Usuarios de Prueba

El script crea automáticamente estos usuarios:

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| Administrador | `admin@brayamsac.com` | `123456` | Acceso total al sistema |
| Coordinador | `coordinador@brayamsac.com` | `123456` | Acceso a subalmacenes asignados |
| Usuario | `usuario@brayamsac.com` | `123456` | Usuario básico |

## 🔧 Comandos Útiles

### Reinicializar base de datos
```bash
# Eliminar y recrear toda la base de datos
node scripts/database/init-local-database.js
```

### Conectar a MySQL desde línea de comandos
```bash
mysql -u root -p
# Luego: USE asistencia_db;
```

### Verificar tablas creadas
```sql
USE asistencia_db;
SHOW TABLES;
```

### Ver usuarios creados
```sql
SELECT u.id, u.nombre, u.correo, r.nombre as rol 
FROM usuarios u 
JOIN roles r ON u.rol_id = r.id;
```

## 🐛 Solución de Problemas

### Error: "Access denied for user 'root'"

**Solución 1:** Verificar contraseña
```bash
mysql -u root -p
# Ingresar la contraseña configurada durante la instalación
```

**Solución 2:** Resetear contraseña de root
```bash
# Detener MySQL
net stop mysql

# Iniciar en modo seguro
mysqld --skip-grant-tables

# En otra terminal
mysql -u root
USE mysql;
UPDATE user SET authentication_string=PASSWORD('') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;

# Reiniciar MySQL normalmente
net start mysql
```

### Error: "Can't connect to MySQL server"

1. Verificar que MySQL esté ejecutándose:
   ```bash
   net start mysql
   ```

2. Verificar puerto 3306:
   ```bash
   netstat -an | findstr 3306
   ```

3. Verificar configuración en `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   ```

### Error: "Database 'asistencia_db' doesn't exist"

Ejecutar nuevamente el script de inicialización:
```bash
node scripts/database/init-local-database.js
```

### Error: "Table doesn't exist"

Verificar que todas las tablas se crearon correctamente:
```sql
USE asistencia_db;
SHOW TABLES;
```

Si faltan tablas, ejecutar manualmente el script SQL:
```bash
mysql -u root -p asistencia_db < scripts/database/init-local-db.sql
```

## 📝 Notas Importantes

1. **Seguridad**: Esta configuración es solo para desarrollo local. No usar en producción.

2. **Datos de prueba**: Los datos creados son solo para testing. Puedes modificar el script para agregar más datos.

3. **Backup**: Antes de reinicializar, haz backup si tienes datos importantes:
   ```bash
   mysqldump -u root -p asistencia_db > backup.sql
   ```

4. **Performance**: Para desarrollo local, la configuración está optimizada para facilidad de uso, no para performance.

## 🔄 Volver a la Base de Datos Remota

Para volver a usar la base de datos de Alwaysdata:

1. Restaurar el archivo `.env` original
2. O cambiar manualmente las variables:
   ```env
   DB_HOST=mysql-brayamsac.alwaysdata.net
   DB_PORT=3306
   DB_USER=417526_brayamsac
   DB_PASSWORD=brayamsac2024
   DB_NAME=brayamsac_asistencia
   ```

3. Reiniciar el servidor backend

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verificar que MySQL esté instalado y ejecutándose
2. Revisar los logs del script de inicialización
3. Verificar la configuración del archivo `.env`
4. Consultar la documentación oficial de MySQL