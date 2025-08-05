import pool from '../../config/db.js';

// Lógica para obtener trabajadores activos con asistencias recientes (mejorada)
export const obtenerTrabajadoresSemana = async () => {
  const [rows] = await pool.query(`
    SELECT 
      t.id,
      t.nombre AS nombre,
      a.nombre AS almacen, 
      s.nombre AS subalmacen, 
      t.activo,
      t.horas_objetivo AS horas_asignadas,
      IFNULL(SUM(TIMESTAMPDIFF(SECOND, asi.hora_entrada, asi.hora_salida)), 0) / 3600 AS horas_trabajadas,
      DATE(MAX(pf.fecha)) AS ultima_asistencia
    FROM trabajadores t
    LEFT JOIN asistencias asi ON asi.trabajador_id = t.id 
    LEFT JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
      AND pf.fecha >= CURDATE() - INTERVAL 7 DAY
      AND asi.hora_entrada IS NOT NULL 
      AND asi.hora_salida IS NOT NULL
      AND asi.hora_entrada != '00:00:00'
      AND asi.hora_salida != '00:00:00'
    JOIN subalmacenes s ON t.subalmacen_id = s.id
    JOIN almacenes a ON s.almacen_id = a.id
    WHERE t.activo = 1
    GROUP BY t.id, t.nombre, a.nombre, s.nombre, t.horas_objetivo
    ORDER BY horas_trabajadas DESC, ultima_asistencia DESC
    LIMIT 5
  `);
  return rows;
};
