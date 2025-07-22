# 📋 Tests de Integración - AsistenciaBrayamsac Backend

## 🧪 Tests Disponibles

### 🔐 **Autenticación**
- `test-login-coordinador.js` - Test login coordinador específico
- `test-login-nuevo-usuario.js` - Test login usuarios nuevos
- `test-login-real.js` - Test login con datos reales
- `test-login-performance.js` - Test rendimiento login
- `test-logout-completo.js` - Test logout completo
- `test-ciclo-login-logout.js` - Test ciclo completo

### 👥 **Usuarios**
- `test-crear-usuario.js` - Test creación usuario básico
- `test-crear-usuario-completo.js` - Test creación usuario completo
- `test-lista-usuarios.js` - Test listado de usuarios
- `test-coordinador-sin-passwords.js` - Test coordinador sin contraseñas

### 🔑 **Passwords**
- `test-passwords-admin.js` - Test gestión passwords admin

### 📊 **Dashboard**
- `test-dashboard-sin-warnings.js` - Test dashboard sin advertencias

### 🌐 **APIs**
- `test-api-coordinadores.js` - Test API coordinadores
- `test-api-rrhh.js` - Test API recursos humanos

## 🚀 Cómo Ejecutar Tests

### ✅ **Test Individual:**
```bash
# Test específico
node tests/integration/test-login-real.js

# Test de rendimiento
node tests/integration/test-login-performance.js

# Test de dashboard
node tests/integration/test-dashboard-sin-warnings.js
```

### ✅ **Scripts NPM:**
```bash
# Test principal
npm run test

# Ver tests disponibles
npm run test:integration

# Tests unitarios (futuro)
npm run test:unit
```

## 📋 Estructura de Test

Cada test sigue este patrón:

```javascript
// Importaciones necesarias
import { test, expect } from './test-framework.js';

// Setup del test
const testName = 'Nombre del Test';

// Ejecución
async function runTest() {
  try {
    // Lógica del test
    console.log('✅ Test passed:', testName);
  } catch (error) {
    console.error('❌ Test failed:', testName, error);
  }
}

// Ejecutar
runTest();
```

## 🎯 Próximos Pasos

### 🔄 **Tests Pendientes:**
- [ ] Tests de almacenes
- [ ] Tests de asistencias
- [ ] Tests de reportes
- [ ] Tests de exportación

### 🧪 **Tests Unitarios:**
- [ ] Tests de servicios
- [ ] Tests de controladores
- [ ] Tests de middlewares
- [ ] Tests de utilidades

### 📊 **Coverage:**
- [ ] Implementar coverage reporting
- [ ] Configurar CI/CD testing
- [ ] Tests de regresión automatizados

## 🚨 Notas Importantes

1. **Datos de Test:** Los tests usan datos de ejemplo, no afectan producción
2. **Base de Datos:** Algunos tests requieren conexión a BD de desarrollo
3. **Autenticación:** Tests incluyen tokens válidos de desarrollo
4. **Performance:** Tests de rendimiento tienen timeouts configurados

## 📖 Referencias

- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodejs-best-practices#-6-testing-and-overall-quality-practices)
- [Jest Testing Framework](https://jestjs.io/)
- [API Testing Guide](../docs/API_GUIDE.md)
