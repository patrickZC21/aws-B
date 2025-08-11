# 🗄️ CONFIGURACIÓN AWS RDS - BASE DE DATOS

## 📋 Información de la Instancia RDS

### Detalles de Conexión
- **Identificador de instancia**: `brayamsac-bd-asistencias`
- **Usuario maestro**: `admin`
- **Contraseña maestra**: `?i#7x1883tU-TNczy!o!Ss`
- **Zona de disponibilidad**: `us-east-1b`
- **Punto de enlace**: `brayamsac-bd-asistencias.cd6ygkkwiLu7.sa-east-1.rds.amazonaws.com`

## 🔧 Archivos Actualizados

### 1. `.env.example`
- ✅ Actualizado con endpoint de AWS RDS
- ✅ Configurado usuario y contraseña
- ✅ Nombre de base de datos actualizado

### 2. `.env.production.example`
- ✅ Configuración completa para producción
- ✅ SSL habilitado para RDS
- ✅ Región AWS actualizada a `sa-east-1`

### 3. `.env.render`
- ✅ Variables descomentadas y configuradas
- ✅ Listo para despliegue en Render

### 4. `src/config/db.js`
- ✅ Soporte mejorado para SSL
- ✅ Compatible con variable `DB_SSL`
- ✅ Configuración optimizada para AWS RDS

## 🚀 Pasos para Usar la Nueva Configuración

### Para Desarrollo Local
1. Copiar `.env.example` a `.env`
2. Verificar que las credenciales sean correctas
3. Asegurar conectividad a AWS RDS desde tu IP

### Para Producción
1. Usar `.env.production.example` como referencia
2. Configurar variables de entorno en el servidor
3. Verificar que SSL esté habilitado

### Para Render
1. Usar las variables del archivo `.env.render`
2. Configurar en el dashboard de Render:
   - `DB_HOST=brayamsac-bd-asistencias.cd6ygkkwiLu7.sa-east-1.rds.amazonaws.com`
   - `DB_USER=admin`
   - `DB_PASSWORD=?i#7x1883tU-TNczy!o!Ss`
   - `DB_NAME=brayamsac-bd-asistencias`
   - `DB_SSL=true`

## ⚠️ Consideraciones de Seguridad

1. **Grupos de Seguridad**: Asegurar que el grupo de seguridad de RDS permita conexiones desde:
   - IP de desarrollo (para testing local)
   - IPs de Render (para producción)
   - Cualquier otro servicio que necesite acceso

2. **SSL/TLS**: La conexión SSL está habilitada por defecto en producción

3. **Credenciales**: 
   - ⚠️ **NUNCA** commitear archivos `.env` con credenciales reales
   - Usar variables de entorno del sistema en producción
   - Rotar contraseñas regularmente

## 🔍 Verificación de Conexión

Para probar la conexión a la base de datos:

```bash
# Desde el directorio del backend
npm run test-db
```

O usar el script de análisis:

```bash
node scripts/database/analyze-database.js
```

## 📝 Notas Adicionales

- La instancia RDS está en la región `sa-east-1` (São Paulo)
- El puerto por defecto es `3306` (MySQL)
- La zona de disponibilidad es `us-east-1b`
- SSL es requerido para conexiones de producción

---

**Fecha de actualización**: $(date)
**Configurado por**: Sistema automatizado
**Versión**: 1.0