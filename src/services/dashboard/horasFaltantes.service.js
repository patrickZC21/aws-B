import pool from '../../config/db.js';

// Lógica para obtener el ranking de trabajadores con horas faltantes
export const obtenerHorasFaltantes = async () => {
  const [rows] = await pool.query(`
    SELECT 
      t.nombre AS trabajador,
      a.nombre AS almacen,
      s.nombre AS subalmacen,
      t.horas_objetivo AS horas_asignadas,
      IFNULL(SUM(TIMESTAMPDIFF(HOUR, asi.hora_entrada, asi.hora_salida)), 0) AS horas_trabajadas,
      (t.horas_objetivo - IFNULL(SUM(TIMESTAMPDIFF(HOUR, asi.hora_entrada, asi.hora_salida)), 0)) AS horas_faltantes,
      t.activo
    FROM trabajadores t
    LEFT JOIN asistencias asi ON asi.trabajador_id = t.id
    JOIN subalmacenes s ON t.subalmacen_id = s.id
    JOIN almacenes a ON s.almacen_id = a.id
    GROUP BY t.id
    HAVING horas_faltantes > 0
    ORDER BY horas_faltantes DESC
    LIMIT 5
  `);
  return rows;
};
