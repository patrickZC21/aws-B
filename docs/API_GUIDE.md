# 📡 Guía de API - Sistema de Asistencias

## 🚀 Inicio Rápido

### Base URL
```
Desarrollo: http://localhost:3000
Producción: https://api.brayamsac.com
```

### Autenticación
Todas las rutas protegidas requieren un token JWT en el header:
```bash
Authorization: Bearer <tu_jwt_token>
```

## 🔐 Autenticación

### POST /api/auth/login
Iniciar sesión en el sistema.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@brayamsac.com",
    "contraseña": "Password123!"
  }'
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Administrador",
    "correo": "admin@brayamsac.com",
    "rol": 2,
    "nombre_rol": "Administrador"
  }
}
```

**Errores:**
- `400` - Datos inválidos
- `401` - Credenciales incorrectas
- `429` - Demasiados intentos (rate limit)

### GET /api/auth/validar
Validar token JWT actual.

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/validar \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "valido": true,
  "usuario": {
    "id": 1,
    "nombre": "Administrador",
    "correo": "admin@brayamsac.com",
    "rol": 2
  }
}
```

### POST /api/auth/logout
Cerrar sesión.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "mensaje": "Sesión cerrada exitosamente"
}
```

## 👥 Gestión de Usuarios

### GET /api/usuarios
Listar todos los usuarios del sistema.

**Request:**
```bash
curl -X GET http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@brayamsac.com",
    "rol_id": 3,
    "nombre_rol": "Coordinador",
    "activo": true,
    "ya_ingreso": false
  },
  {
    "id": 2,
    "nombre": "María García",
    "correo": "maria@brayamsac.com",
    "rol_id": 2,
    "nombre_rol": "Administrador",
    "activo": true,
    "ya_ingreso": true
  }
]
```

### POST /api/usuarios
Crear nuevo usuario.

**Request:**
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos López",
    "correo": "carlos@brayamsac.com",
    "password": "Password123!",
    "rol_id": 3,
    "activo": true,
    "almacenes": [
      {
        "subalmacen_id": 1,
        "limite_ingresos": 100
      },
      {
        "subalmacen_id": 2,
        "limite_ingresos": 50
      }
    ]
  }'
```

**Response (201):**
```json
{
  "usuario": {
    "id": 3,
    "nombre": "Carlos López",
    "correo": "carlos@brayamsac.com",
    "rol_id": 3,
    "activo": true,
    "ya_ingreso": false
  },
  "almacenes": [
    {
      "id": 1,
      "usuario_id": 3,
      "subalmacen_id": 1,
      "limite_ingresos": 100
    },
    {
      "id": 2,
      "usuario_id": 3,
      "subalmacen_id": 2,
      "limite_ingresos": 50
    }
  ]
}
```

### GET /api/usuarios/:id
Obtener usuario específico.

**Request:**
```bash
curl -X GET http://localhost:3000/api/usuarios/1 \
  -H "Authorization: Bearer <token>"
```

### PUT /api/usuarios/:id
Actualizar usuario.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez Actualizado",
    "correo": "juan.nuevo@brayamsac.com",
    "activo": true
  }'
```

### DELETE /api/usuarios/:id
Eliminar usuario (eliminación en cascada).

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/usuarios/1 \
  -H "Authorization: Bearer <token>"
```

## 👷 Gestión de Trabajadores

### GET /api/trabajadores
Listar trabajadores.

**Request:**
```bash
curl -X GET http://localhost:3000/api/trabajadores \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Pedro Martínez",
    "dni": "12345678",
    "subalmacen_id": 1,
    "coordinador_id": 3,
    "horas_objetivo": 160,
    "activo": true,
    "almacen": "Almacén Central",
    "subalmacen": "Zona A",
    "coordinador": "Juan Pérez"
  }
]
```

### POST /api/trabajadores
Crear trabajador.

**Request:**
```bash
curl -X POST http://localhost:3000/api/trabajadores \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana Rodríguez",
    "dni": "87654321",
    "subalmacen_id": 1,
    "coordinador_id": 3,
    "horas_objetivo": 160
  }'
```

### PUT /api/trabajadores/:id
Actualizar trabajador.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/trabajadores/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro Martínez Actualizado",
    "horas_objetivo": 180
  }'
```

## ✅ Gestión de Asistencias

### GET /api/asistencias
Listar asistencias con filtros opcionales.

**Request básico:**
```bash
curl -X GET http://localhost:3000/api/asistencias \
  -H "Authorization: Bearer <token>"
```

**Request con filtros:**
```bash
curl -X GET "http://localhost:3000/api/asistencias?programacion_fecha_id=1&subalmacen_id=1" \
  -H "Authorization: Bearer <token>"
```

**Parámetros de consulta disponibles:**
- `programacion_fecha_id` - Filtrar por fecha específica
- `subalmacen_id` - Filtrar por subalmacén
- `trabajador_id` - Filtrar por trabajador

**Response (200):**
```json
[
  {
    "id": 1,
    "trabajador_id": 1,
    "subalmacen_id": 1,
    "hora_entrada": "08:00:00",
    "hora_salida": "17:00:00",
    "justificacion": "Sin novedades",
    "registrado_por": 3,
    "programacion_fecha_id": 1,
    "trabajador_nombre": "Pedro Martínez",
    "trabajador_dni": "12345678",
    "subalmacen_nombre": "Zona A",
    "almacen_nombre": "Almacén Central",
    "registrado_por_nombre": "Juan Pérez"
  }
]
```

### POST /api/asistencias
Registrar nueva asistencia.

**Request:**
```bash
curl -X POST http://localhost:3000/api/asistencias \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "trabajador_id": 1,
    "subalmacen_id": 1,
    "hora_entrada": "08:30",
    "hora_salida": "17:30",
    "justificacion": "Llegada tardía por tráfico",
    "registrado_por": 3,
    "programacion_fecha_id": 1
  }'
```

**Response (201):**
```json
{
  "id": 2,
  "mensaje": "Asistencia registrada correctamente"
}
```

### PUT /api/asistencias/:id
Actualizar asistencia existente.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/asistencias/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "hora_entrada": "08:15",
    "hora_salida": "17:15",
    "justificacion": "Horario actualizado"
  }'
```

### DELETE /api/asistencias/:id
Eliminar asistencia.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/asistencias/1 \
  -H "Authorization: Bearer <token>"
```

## 🏪 Gestión de Almacenes

### GET /api/almacenes
Listar almacenes.

**Request:**
```bash
curl -X GET http://localhost:3000/api/almacenes \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Almacén Central",
    "descripcion": "Almacén principal de la empresa",
    "ubicacion": "Lima, Perú",
    "activo": true
  }
]
```

### POST /api/almacenes
Crear almacén.

**Request:**
```bash
curl -X POST http://localhost:3000/api/almacenes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Almacén Norte",
    "descripcion": "Almacén de la zona norte",
    "ubicacion": "Trujillo, Perú"
  }'
```

### GET /api/subalmacenes
Listar subalmacenes.

**Request:**
```bash
curl -X GET http://localhost:3000/api/subalmacenes \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Zona A",
    "descripcion": "Primera zona del almacén",
    "almacen_id": 1,
    "refrigerio": "30 minutos",
    "jornada": "8 horas",
    "activo": true,
    "almacen_nombre": "Almacén Central"
  }
]
```

## 📊 Exportación de Reportes

### GET /api/exportar/fechas-excel
Exportar asistencias por fechas a Excel.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/exportar/fechas-excel?fechasIds=1,2,3&subalmacenId=1" \
  -H "Authorization: Bearer <token>" \
  -o "asistencias_reporte.xlsx"
```

**Parámetros:**
- `fechasIds` (requerido) - IDs de fechas separados por comas
- `subalmacenId` (opcional) - ID del subalmacén para filtrar

**Response:**
- Archivo Excel con formato profesional
- Headers apropiados para descarga
- Nombre de archivo con timestamp

### GET /api/exportar/asistencias/trabajador/:id
Exportar asistencias de un trabajador específico.

**Request:**
```bash
curl -X GET "http://localhost:3000/api/exportar/asistencias/trabajador/1?fechaInicio=2024-01-01&fechaFin=2024-01-31" \
  -H "Authorization: Bearer <token>" \
  -o "asistencias_trabajador.xlsx"
```

**Parámetros:**
- `fechaInicio` (opcional) - Fecha de inicio (YYYY-MM-DD)
- `fechaFin` (opcional) - Fecha de fin (YYYY-MM-DD)

## 📈 Dashboard y Métricas

### GET /api/dashboard/stats
Obtener estadísticas del dashboard.

**Request:**
```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "trabajadores_activos": 25,
  "asistencias_hoy": 23,
  "horas_trabajadas_mes": 3200,
  "ausentismo_porcentaje": 8.0,
  "top_trabajadores": [
    {
      "nombre": "Pedro Martínez",
      "horas_mes": 180
    }
  ],
  "estadisticas_subalmacenes": [
    {
      "subalmacen": "Zona A",
      "asistencias": 120,
      "promedio_horas": 8.2
    }
  ]
}
```

## 🔧 Permisos y Accesos

### GET /api/permisos/mis-accesos
Obtener accesos del usuario autenticado.

**Request:**
```bash
curl -X GET http://localhost:3000/api/permisos/mis-accesos \
  -H "Authorization: Bearer <token>"
```

**Response para Administrador:**
```json
{
  "success": true,
  "data": {
    "rol": "administrador",
    "almacenes": [...],
    "subalmacenes": [...],
    "acceso_total": true,
    "total_almacenes": 5,
    "total_subalmacenes": 15
  }
}
```

**Response para Coordinador:**
```json
{
  "success": true,
  "data": {
    "rol": "coordinador",
    "accesos_limitados": true,
    "subalmacenes_asignados": [
      {
        "subalmacen_id": 1,
        "subalmacen_nombre": "Zona A",
        "almacen_nombre": "Almacén Central",
        "limite_ingresos": 100
      }
    ],
    "total_subalmacenes": 2
  }
}
```

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado |
| `400` | Bad Request | Datos inválidos |
| `401` | Unauthorized | Token inválido/faltante |
| `403` | Forbidden | Sin permisos |
| `404` | Not Found | Recurso no encontrado |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error del servidor |

### Formato de Errores

**Error básico:**
```json
{
  "error": "Token JWT inválido",
  "detalle": "JsonWebTokenError: invalid signature"
}
```

**Error de validación:**
```json
{
  "error": "Datos de entrada inválidos",
  "detalles": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "El correo debe tener un formato válido",
      "path": "correo",
      "location": "body"
    }
  ]
}
```

**Error de rate limiting:**
```json
{
  "error": "Demasiados intentos de login desde esta IP, intenta de nuevo en 15 minutos"
}
```

## 🚀 Ejemplos de Flujos Completos

### Flujo 1: Autenticación y Lista de Usuarios
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@brayamsac.com","contraseña":"Password123!"}' \
  | jq -r '.token')

# 2. Listar usuarios
curl -X GET http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer $TOKEN"
```

### Flujo 2: Crear Usuario con Asignaciones
```bash
# 1. Crear usuario con almacenes asignados
curl -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Coordinador",
    "correo": "coordinador@brayamsac.com",
    "password": "Password123!",
    "rol_id": 3,
    "almacenes": [
      {"subalmacen_id": 1, "limite_ingresos": 100}
    ]
  }'
```

### Flujo 3: Registrar Asistencia
```bash
# 1. Obtener ID de fecha programada
FECHA_ID=$(curl -s -X GET http://localhost:3000/api/fechas \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[0].id')

# 2. Registrar asistencia
curl -X POST http://localhost:3000/api/asistencias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"trabajador_id\": 1,
    \"subalmacen_id\": 1,
    \"hora_entrada\": \"08:00\",
    \"hora_salida\": \"17:00\",
    \"justificacion\": \"Sin novedades\",
    \"registrado_por\": 1,
    \"programacion_fecha_id\": $FECHA_ID
  }"
```

### Flujo 4: Exportar Reporte
```bash
# 1. Obtener IDs de fechas del mes actual
FECHAS_IDS=$(curl -s -X GET http://localhost:3000/api/fechas \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r 'map(.id) | join(",")')

# 2. Exportar a Excel
curl -X GET "http://localhost:3000/api/exportar/fechas-excel?fechasIds=$FECHAS_IDS" \
  -H "Authorization: Bearer $TOKEN" \
  -o "reporte_$(date +%Y%m%d).xlsx"
```

## 📝 Notas Importantes

### Rate Limiting
- **Login**: 5 intentos por IP cada 15 minutos
- **API General**: 100 requests por IP cada 15 minutos
- Los límites se resetean automáticamente

### Seguridad
- Todos los passwords se encriptan con bcrypt (12 rounds)
- Los tokens JWT expiran en 8 horas por defecto
- Todas las consultas SQL usan prepared statements
- Input sanitization automática para prevenir XSS

### Performance
- Connection pooling configurado (10 conexiones máximo)
- Bulk operations para inserción masiva
- Índices optimizados en base de datos
- Queries con LIMIT para prevenir sobrecarga

### Formatos de Fecha/Hora
- **Fechas**: YYYY-MM-DD (ej: 2024-01-15)
- **Horas**: HH:MM (ej: 08:30, 17:45)
- **Timestamps**: ISO 8601 UTC

---

Esta guía cubre los endpoints principales del sistema. Para documentación interactiva completa, visita `/api-docs` cuando el servidor esté ejecutándose.
