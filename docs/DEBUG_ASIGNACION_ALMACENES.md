## 🛠️ SCRIPT DE PRUEBA: ASIGNACIÓN ALMACENES

Para probar manualmente el endpoint, abre la consola del navegador y ejecuta:

```javascript
// 1. Verificar conectividad con el backend
fetch('http://localhost:3000/api/almacenes', {
  headers: { 
    'Authorization': `Bearer ${localStorage.getItem('token')}` 
  }
})
.then(res => res.json())
.then(data => console.log('✅ Backend conectado:', data))
.catch(err => console.error('❌ Backend no conectado:', err));

// 2. Probar endpoint de asignación (REEMPLAZAR usuario_id y subalmacen_id)
fetch('http://localhost:3000/api/usuario-almacenes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    usuario_id: 1, // CAMBIAR por ID real
    almacenes: [
      {
        subalmacen_id: 1, // CAMBIAR por ID real
        limite_ingresos: 1
      }
    ]
  })
})
.then(res => res.json())
.then(data => console.log('✅ Asignación exitosa:', data))
.catch(err => console.error('❌ Error en asignación:', err));
```

## 🔍 VERIFICACIONES ADICIONALES:

### 1. Verificar Backend
```bash
# En PowerShell, ir al directorio del backend
cd "c:\Users\Patrick\OneDrive\Escritorio\AsistenciaBrayamsac\Backend"

# Verificar que esté corriendo
netstat -ano | findstr :3000

# Si no está corriendo, iniciarlo
npm start
```

### 2. Verificar Base de Datos
- Asegurar que MySQL esté corriendo
- Verificar que las tablas `usuarios`, `subalmacenes`, `usuario_almacenes` existan
- Verificar que haya datos en `subalmacenes`

### 3. Posibles Causas del Error "Failed to fetch":

1. **Backend no está corriendo** en puerto 3000
2. **CORS no configurado** correctamente  
3. **Token expirado** o inválido
4. **Base de datos desconectada**
5. **Endpoint mal configurado** en las rutas

### 4. Soluciones Rápidas:

```bash
# Reiniciar backend
cd Backend
npm start

# Verificar logs del backend en la consola
# Buscar errores de conexión o SQL
```

## 📋 CHECKLIST DE DEBUGGING:

- [ ] Backend corriendo en puerto 3000
- [ ] MySQL corriendo y conectado  
- [ ] Token válido en localStorage
- [ ] Endpoint `/api/usuario-almacenes` configurado
- [ ] Datos válidos en las tablas relacionadas
- [ ] CORS configurado para permitir requests desde frontend
- [ ] No hay errores en console del navegador (Network tab)

Si el error persiste después de estas verificaciones, revisar los logs del backend para más detalles.
