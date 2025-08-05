import pool from '../../config/db.js';

/**
 * Obtiene el resumen general del dashboard con una sola consulta optimizada
 * @returns {Promise<Object>} Objeto con los conteos de almacenes, subalmacenes, coordinadores y trabajadores
 */
export const obtenerResumenDashboard = async () => {
  const startTime = Date.now();
  
  try {
    // Una sola consulta optimizada con subconsultas para obtener todos los conteos
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM almacenes) AS total_almacenes,
        (SELECT COUNT(*) FROM subalmacenes) AS total_subalmacenes,
        (SELECT COUNT(*) FROM usuarios WHERE rol_id = ? AND activo = ?) AS total_coordinadores,
        (SELECT COUNT(*) FROM trabajadores WHERE activo = ?) AS total_trabajadores
    `;
    
    const [[result]] = await pool.query(query, [3, 1, 1]);
    
    const executionTime = Date.now() - startTime;
    console.log(`Dashboard resumen obtenido en ${executionTime}ms`);
    
    return {
      total_almacenes: result.total_almacenes,
      total_subalmacenes: result.total_subalmacenes,
      total_coordinadores: result.total_coordinadores,
      total_trabajadores: result.total_trabajadores
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`Error en obtenerResumenDashboard después de ${executionTime}ms:`, error);
    throw new Error('Error al obtener el resumen del dashboard');
  }
};
