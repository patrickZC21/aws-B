import pool from '../config/db.js';
import { calcularResumenAsistencias } from '../utils/date.helper.js';

/**
 * Obtiene asistencias y cálculos de un trabajador específico con consulta optimizada
 * @param {number} trabajadorId - ID del trabajador
 * @returns {Promise<Object>} Objeto con resumen y asistencias
 */
export const obtenerAsistenciasPorTrabajador = async (trabajadorId) => {
  const startTime = Date.now();
  
  try {
    // Consulta optimizada con índices implícitos y menos JOINs
    const [rows] = await pool.query(
      `SELECT
        t.dni,
        t.nombre AS trabajador,
        sa.nombre AS subalmacen,
        a.nombre AS almacen,
        pf.fecha,
        t.horas_objetivo,
        asi.hora_entrada,
        asi.hora_salida,
        asi.justificacion,
        asi.id
      FROM asistencias asi
      INNER JOIN trabajadores t ON asi.trabajador_id = t.id
      INNER JOIN subalmacenes sa ON asi.subalmacen_id = sa.id
      INNER JOIN almacenes a ON sa.almacen_id = a.id
      INNER JOIN programacion_fechas pf ON asi.programacion_fecha_id = pf.id
      WHERE t.id = ? AND asi.id IS NOT NULL
      ORDER BY pf.fecha DESC, asi.hora_entrada ASC`,
      [trabajadorId]
    );

    // Filtrar cualquier registro null que pueda haber pasado
    const asistenciasLimpias = rows.filter(row => row && row.id !== null && row.id !== undefined);

    // Procesa resumen de horas de manera eficiente
    const resumen = calcularResumenAsistencias(asistenciasLimpias);
    
    const executionTime = Date.now() - startTime;
    
    // Log optimizado solo en desarrollo o si hay problemas de rendimiento
    if (executionTime > 100) {
      console.warn(`⚠️ Consulta lenta: Asistencias trabajador ${trabajadorId} - ${executionTime}ms`);
    }

    return { resumen, asistencias: asistenciasLimpias };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`Error obteniendo asistencias trabajador ${trabajadorId} después de ${executionTime}ms:`, error);
    throw error;
  }
};
