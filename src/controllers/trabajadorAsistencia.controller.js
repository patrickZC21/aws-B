import * as TrabajadorAsistenciaService from '../services/trabajadorAsistencia.service.js';
import { calcularResumenAsistencias } from '../utils/date.helper.js';

/**
 * Obtiene todas las asistencias de un trabajador específico con manejo optimizado
 * @param {Object} req - Request con ID del trabajador en params
 * @param {Object} res - Response object
 */
export const verAsistenciasDeTrabajador = async (req, res) => {
  const { id } = req.params;
  
  // Validación de entrada
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID de trabajador inválido' });
  }

  try {
    const { resumen, asistencias } = await TrabajadorAsistenciaService.obtenerAsistenciasPorTrabajador(Number(id));

    // Logging para debugging
    console.log(`[Debug] Asistencias recibidas para trabajador ${id}:`, {
      totalAsistencias: asistencias?.length || 0,
      primerElemento: asistencias?.[0] || null,
      elementosNull: asistencias?.filter(a => !a).length || 0
    });

    // Si no hay asistencias, devolver estructura consistente sin recálculo innecesario
    if (!asistencias || asistencias.length === 0) {
      return res.json({ 
        resumen: {
          horas_reales: 0,
          horas_cumplidas: 0,
          horas_extras: 0,
          horas_faltantes: 0
        }, 
        asistencias: [] 
      });
    }

    // Filtrar elementos null como precaución adicional
    const asistenciasSeguras = asistencias.filter(asis => asis && typeof asis === 'object' && asis.id);

    res.json({ resumen, asistencias: asistenciasSeguras });
  } catch (error) {
    console.error(`Error al obtener asistencias del trabajador ${id}:`, error.message);
    res.status(500).json({ error: 'Error al obtener asistencias del trabajador' });
  }
};
