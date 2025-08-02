# 🔐 GUÍA COMPLETA DE CONTRASEÑAS - SISTEMA BRAYAMSAC

## 📋 RESUMEN EJECUTIVO

✅ **PROBLEMA SOLUCIONADO**: Ahora cuando crees usuarios desde el frontend, el sistema automáticamente:
- Encripta las contraseñas con bcrypt
- Te muestra la contraseña original en la respuesta
- Permite login con la contraseña que asignaste

---

## 🔑 CONTRASEÑAS ACTUALES

### **USUARIOS EXISTENTES (Creados antes):**
| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Soledad Ramírez | sramirez@brayam.com | `123456` | RRHH |
| Admin Central | admin01@brayam.com | `123456` | ADMINISTRACION |
| Andrea Torres | atorres@brayam.com | `123456` | ADMINISTRACION |
| Fernanda Torres | asdf@brayam.com | `123456` | COORDINADOR |
| Diego Bailon | DiegoBailon2025@brayam.com | `123456` | COORDINADOR |
| Lidia Karla Quispe | recursoshumanos2025@brayam.com | `123456` | RRHH |

### **USUARIOS NUEVOS:**
- **Coordinador Test**: coordinador.test@brayam.com → `testPassword2025`

---

## 🎯 CÓMO CREAR USUARIOS DESDE EL FRONTEND

### **1. En la página de Coordinadores:**
1. Click en "Agregar Coordinador"
2. Llena el formulario:
   - **Nombre**: Ej. "Juan Pérez"
   - **Email**: Ej. "juan.perez@brayam.com"
   - **Contraseña**: Ej. "miPassword123" ← **APUNTA ESTA**
   - **Rol**: Selecciona "COORDINADOR"
3. Click "Guardar"

### **2. El sistema te responderá:**
```json
{
  "usuario": {
    "id": 62,
    "nombre": "Juan Pérez",
    "correo": "juan.perez@brayam.com",
    "password_para_login": "miPassword123"
  },
  "mensaje": "Usuario creado exitosamente. Contraseña para login: miPassword123"
}
```

### **3. Para que el usuario haga login:**
- **Email**: juan.perez@brayam.com
- **Contraseña**: miPassword123

---

## 🔧 LO QUE CAMBIÓ TÉCNICAMENTE

### **ANTES (Problema):**
```javascript
// ❌ Se guardaba contraseña en texto plano
password: "123456" // Visible en la base de datos
```

### **DESPUÉS (Solucionado):**
```javascript
// ✅ Se encripta automáticamente
password: "$2b$10$xyz..." // Hash bcrypt en la base de datos
password_para_login: "123456" // Solo en la respuesta para referencia
```

---

## 📱 USO EN EL FRONTEND

### **Cuando crees un usuario:**
```javascript
// Frontend envía
{
  "nombre": "Nuevo Usuario",
  "correo": "nuevo@brayam.com", 
  "password": "miContraseña123",
  "rol_id": 3
}

// Backend responde
{
  "usuario": {
    "password_para_login": "miContraseña123" // ← GUARDA ESTO
  },
  "mensaje": "Usuario creado exitosamente. Contraseña para login: miContraseña123"
}
```

### **Para que el usuario haga login:**
- **URL**: http://localhost:5173/loginSistema
- **Email**: nuevo@brayam.com
- **Contraseña**: miContraseña123

---

## 🎯 RECOMENDACIONES

### **1. Para Admin/RRHH:**
- ✅ Apunta siempre la contraseña que asignas
- ✅ Comunica las credenciales de forma segura
- ✅ Usa contraseñas fáciles de recordar pero seguras

### **2. Ejemplos de contraseñas recomendadas:**
- `Coord2025!` (para coordinadores)
- `Brayam123` (estándar empresa)
- `Almacen2025` (para roles específicos)

### **3. Para recordar contraseñas:**
- 📝 Mantén una lista en lugar seguro
- 📝 Usa patrón: `NombreUsuario2025`
- 📝 Documento Excel protegido con contraseñas

---

## 🧪 TESTING

### **Para probar un usuario nuevo:**
```bash
# En el backend
node test-crear-usuario-completo.js
node test-login-nuevo-usuario.js
```

### **Para ver todos los usuarios:**
```bash
node consultar-usuarios-completo.js
```

---

## 🔐 SEGURIDAD

### **✅ LO QUE ESTÁ PROTEGIDO:**
- Contraseñas encriptadas en BD con bcrypt
- Tokens JWT para sesiones
- Validación de sesión única
- Rate limiting en login

### **📝 LO QUE DEBES HACER:**
- Apuntar contraseñas asignadas
- Comunicar credenciales de forma segura
- Cambiar contraseñas periódicamente

---

## 📞 SOPORTE

Si necesitas:
- **Ver contraseñas existentes**: Ejecuta `node consultar-usuarios-completo.js`
- **Crear usuario de prueba**: Ejecuta `node test-crear-usuario-completo.js`
- **Resetear contraseña**: Contactar administrador del sistema

---

## 🎉 CONCLUSIÓN

✅ **PROBLEMA RESUELTO**: Ya no tendrás problemas para saber las contraseñas  
✅ **SISTEMA SEGURO**: Las contraseñas están encriptadas  
✅ **FÁCIL DE USAR**: La respuesta te dice qué contraseña usar  
✅ **ESCALABLE**: Funciona para todos los usuarios nuevos
