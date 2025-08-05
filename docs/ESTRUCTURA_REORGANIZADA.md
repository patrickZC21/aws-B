# 📁 ESTRUCTURA REORGANIZADA DEL BACKEND

## 🎯 Nueva Organización

```
Backend/
├── 📄 .env                          # Variables de entorno
├── 📄 .env.example                  # Plantilla de variables
├── 📄 .env.production.example       # Plantilla producción
├── 📄 .gitignore                    # Archivos ignorados por git
├── 📄 app.js                        # Aplicación principal (legacy)
├── 📄 package.json                  # Dependencias y scripts
├── 📄 README.md                     # Documentación principal
│
├── 📂 src/                          # Código fuente principal
│   ├── 📄 index.js                  # Punto de entrada
│   ├── 📂 config/                   # Configuraciones
│   │   ├── db.js                    # Configuración BD
│   │   └── swagger.js               # Configuración Swagger
│   ├── 📂 controllers/              # Controladores
│   ├── 📂 middlewares/              # Middlewares
│   ├── 📂 routes/                   # Rutas
│   ├── 📂 services/                 # Lógica de negocio
│   └── 📂 utils/                    # Utilidades
│
├── 📂 tests/                        # Tests y pruebas
│   ├── 📂 integration/              # Tests de integración
│   │   ├── test-api-coordinadores.js
│   │   ├── test-login-real.js
│   │   ├── test-dashboard-sin-warnings.js
│   │   └── ... (14 archivos de test)
│   └── 📂 unit/                     # Tests unitarios (futuro)
│
├── 📂 scripts/                      # Scripts de utilidad
│   ├── 📂 database/                 # Scripts de BD
│   │   ├── check-users.js           # Verificar usuarios
│   │   ├── encrypt-passwords.js     # Encriptar contraseñas
│   │   ├── analyze-database.js      # Análisis de BD
│   │   └── ... (16 scripts de BD)
│   └── 📂 maintenance/              # Scripts de mantenimiento
│
└── 📂 docs/                         # Documentación
    ├── API_GUIDE.md                 # Guía de API
    ├── TECHNICAL_DOCS.md            # Docs técnicas
    ├── AUDITORIA_SEGURIDAD_BACKEND.md
    ├── CHECKLIST_PRE_DESPLIEGUE_AWS.md
    └── ... (18 documentos)
```

## 🔄 Cambios Realizados

### ✅ **Archivos Movidos:**

#### 📂 tests/integration/ (14 archivos)
- `test-api-coordinadores.js`
- `test-login-real.js`
- `test-dashboard-sin-warnings.js`
- `test-passwords-admin.js`
- Y 10 archivos más de testing

#### 📂 scripts/database/ (16 archivos)
- `check-users.js`
- `encrypt-passwords.js`
- `analyze-database.js`
- `security-audit.js`
- `verificar-coordinadores.js`
- Y 11 archivos más de BD

#### 📂 docs/ (18 archivos)
- `API_GUIDE.md`
- `TECHNICAL_DOCS.md`
- `AUDITORIA_SEGURIDAD_BACKEND.md`
- `CHECKLIST_PRE_DESPLIEGUE_AWS.md`
- `LOGIN_OPTIMIZATION_REPORT.md`
- Y 13 documentos más

### ✅ **Archivos Mantenidos en Raíz:**
- `src/` - Código fuente principal
- `package.json` - Configuración NPM
- `README.md` - Documentación principal
- `.env*` - Variables de entorno
- `app.js` - Aplicación legacy (por compatibilidad)

## 🎯 Beneficios de la Reorganización

### 🧹 **Limpieza:**
- ✅ Raíz del proyecto limpia y profesional
- ✅ Separación clara entre código, tests y docs
- ✅ Fácil navegación y comprensión

### 🔍 **Mejor Organización:**
- ✅ Tests agrupados por tipo (integración/unitarios)
- ✅ Scripts categorizados (BD/mantenimiento)
- ✅ Documentación centralizada

### 👥 **Desarrollo en Equipo:**
- ✅ Estructura estándar de proyecto Node.js
- ✅ Fácil onboarding para nuevos desarrolladores
- ✅ Mejor mantenibilidad del código

### 🚀 **DevOps/Despliegue:**
- ✅ Scripts organizados por función
- ✅ Tests claramente identificados
- ✅ Documentación accesible

## 📋 Scripts NPM Actualizados

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development nodemon src/index.js",
    "start": "cross-env NODE_ENV=production node src/index.js",
    "test": "node tests/integration/test-login-real.js",
    "test:integration": "node tests/integration/",
    "db:check": "node scripts/database/check-users.js",
    "db:analyze": "node scripts/database/analyze-database.js",
    "security:audit": "node scripts/database/security-audit.js",
    "docs": "echo 'Documentación en ./docs/ - Ver docs/DOCS_INDEX.md'"
  }
}
```

## 🔗 Referencias Rápidas

### 🧪 **Testing:**
```bash
# Tests de integración
npm run test:integration

# Test específico
node tests/integration/test-login-real.js
```

### 🗄️ **Base de Datos:**
```bash
# Verificar usuarios
node scripts/database/check-users.js

# Analizar BD
node scripts/database/analyze-database.js

# Auditoría de seguridad
node scripts/database/security-audit.js
```

### 📖 **Documentación:**
```bash
# Ver índice de documentos
cat docs/DOCS_INDEX.md

# Guía de API
cat docs/API_GUIDE.md

# Auditoría de seguridad
cat docs/AUDITORIA_SEGURIDAD_BACKEND.md
```

## 🎉 **Estado Actual:** ✅ REORGANIZADO Y OPTIMIZADO

La estructura ahora sigue las mejores prácticas de proyectos Node.js profesionales, facilitando el desarrollo, testing, y mantenimiento del sistema.
