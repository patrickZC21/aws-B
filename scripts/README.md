# 🛠️ Scripts de Base de Datos - AsistenciaBrayamsac

## 📋 Scripts Disponibles

### 🔍 **Verificación y Análisis**
- `check-users.js` - Verificar estado de usuarios
- `check-asistencias-table.js` - Verificar tabla asistencias
- `check-programacion-fechas.js` - Verificar programación de fechas
- `analyze-database.js` - Análisis completo de BD
- `security-audit.js` - Auditoría de seguridad

### 👥 **Gestión de Usuarios**
- `consultar-usuarios.js` - Consultar usuarios básico
- `consultar-usuarios-completo.js` - Consultar usuarios detallado
- `verificar-coordinadores.js` - Verificar coordinadores
- `verificar-ya-ingreso.js` - Verificar estado de login

### 🔐 **Gestión de Contraseñas**
- `encrypt-passwords.js` - Encriptar contraseñas
- `mostrar-passwords.js` - Mostrar contraseñas (desarrollo)
- `actualizar-password-coordinador.js` - Actualizar password coordinador
- `verificar-password-coordinador.js` - Verificar password coordinador
- `crear-tabla-passwords.js` - Crear tabla de passwords

### 🔄 **Sesiones**
- `resetear-sesiones.js` - Resetear sesiones generales
- `resetear-sesiones-coordinadores.js` - Resetear sesiones coordinadores

## 🚀 Cómo Usar

### ✅ **Scripts NPM:**
```bash
# Verificar usuarios
npm run db:check

# Analizar base de datos
npm run db:analyze

# Encriptar contraseñas
npm run db:encrypt

# Auditoría de seguridad
npm run security:audit
```

### ✅ **Ejecución Directa:**
```bash
# Verificar estado de usuarios
node scripts/database/check-users.js

# Análisis completo de BD
node scripts/database/analyze-database.js

# Verificar coordinadores
node scripts/database/verificar-coordinadores.js

# Resetear sesiones
node scripts/database/resetear-sesiones.js
```

## 📋 Descripción Detallada

### 🔍 **Scripts de Verificación:**

#### `check-users.js`
```bash
# Verifica:
- Estados de usuarios activos/inactivos
- Usuarios sin contraseña
- Usuarios con sesiones activas
- Roles asignados correctamente
```

#### `analyze-database.js`
```bash
# Analiza:
- Integridad de datos
- Índices de rendimiento
- Relaciones entre tablas
- Estadísticas de uso
```

#### `security-audit.js`
```bash
# Audita:
- Contraseñas débiles
- Usuarios duplicados
- Permisos incorrectos
- Vulnerabilidades de seguridad
```

### 🔐 **Scripts de Contraseñas:**

#### `encrypt-passwords.js`
```bash
# Funciones:
- Encripta contraseñas en texto plano
- Actualiza hashes existentes
- Verifica integridad de encriptación
```

#### `verificar-password-coordinador.js`
```bash
# Verifica:
- Password de coordinador específico
- Estado de encriptación
- Validez del hash bcrypt
```

### 🔄 **Scripts de Sesiones:**

#### `resetear-sesiones.js`
```bash
# Resetea:
- Todas las sesiones activas
- Campo ya_ingreso = 0
- Limpia tokens expirados
```

## ⚠️ **Precauciones**

### 🔒 **Seguridad:**
- ❌ **NO ejecutar** `mostrar-passwords.js` en producción
- ❌ **NO commitear** logs con contraseñas
- ✅ **SÍ verificar** permisos antes de ejecutar
- ✅ **SÍ hacer backup** antes de scripts de modificación

### 🗄️ **Base de Datos:**
- ⚠️ Scripts modifican datos directamente
- ⚠️ Algunos requieren privilegios de administrador
- ⚠️ Hacer backup antes de ejecutar scripts de cambio

### 🧪 **Desarrollo vs Producción:**
```bash
# Desarrollo - OK
NODE_ENV=development node scripts/database/check-users.js

# Producción - CUIDADO
NODE_ENV=production node scripts/database/resetear-sesiones.js
```

## 📊 Scripts por Frecuencia de Uso

### 🔥 **Uso Frecuente:**
- `check-users.js` - Verificación diaria
- `resetear-sesiones.js` - Resolución de conflictos
- `analyze-database.js` - Monitoreo semanal

### 🔄 **Uso Ocasional:**
- `encrypt-passwords.js` - Migraciones
- `security-audit.js` - Auditorías mensuales
- `verificar-coordinadores.js` - Troubleshooting

### ⚡ **Uso Esporádico:**
- `crear-tabla-passwords.js` - Setup inicial
- `actualizar-password-coordinador.js` - Casos específicos

## 🎯 Próximos Scripts

### 📋 **Planificados:**
- [ ] `backup-database.js` - Backup automatizado
- [ ] `migrate-data.js` - Migración de datos
- [ ] `performance-check.js` - Análisis de rendimiento
- [ ] `cleanup-old-data.js` - Limpieza de datos antiguos

## 📖 Referencias

- [MySQL Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Database Security Guide](../docs/GUIA_CONTRASEÑAS.md)
- [Performance Optimization](../docs/OPTIMIZACION_RENDIMIENTO_COORDINADORES.md)
