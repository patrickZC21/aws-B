-- Optimización de índices para el sistema de asistencias
-- Ejecutar estos comandos en la base de datos MySQL

-- Índice compuesto para la consulta principal de asistencias
CREATE INDEX IF NOT EXISTS idx_asistencias_lookup 
ON asistencias (programacion_fecha_id, subalmacen_id, trabajador_id);

-- Índice para búsquedas por trabajador
CREATE INDEX IF NOT EXISTS idx_asistencias_trabajador 
ON asistencias (trabajador_id, programacion_fecha_id);

-- Índice para búsquedas por subalmacén
CREATE INDEX IF NOT EXISTS idx_asistencias_subalmacen 
ON asistencias (subalmacen_id, programacion_fecha_id);

-- Índice para ordenamiento por ID (optimiza ORDER BY)
CREATE INDEX IF NOT EXISTS idx_asistencias_id_desc 
ON asistencias (id DESC);

-- Índices para tablas relacionadas si no existen
CREATE INDEX IF NOT EXISTS idx_subalmacenes_almacen 
ON subalmacenes (almacen_id);

CREATE INDEX IF NOT EXISTS idx_programacion_fechas_lookup 
ON programacion_fechas (fecha, subalmacen_id);

-- Estadísticas de tablas (MySQL 8.0+)
-- ANALYZE TABLE asistencias;
-- ANALYZE TABLE trabajadores;
-- ANALYZE TABLE subalmacenes;
-- ANALYZE TABLE almacenes;
-- ANALYZE TABLE usuarios;
-- ANALYZE TABLE programacion_fechas;
