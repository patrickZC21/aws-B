import * as TrabajadoresSemanaService from '../../services/dashboard/trabajadoresSemana.service.js';

// Endpoint para obtener trabajadores recientes de la semana
export const obtenerTrabajadoresSemana = async (req, res) => {
  try {
    const rows = await TrabajadoresSemanaService.obtenerTrabajadoresSemana();
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener trabajadores de la semana:', error);
    // Enviar el error SQL real si existe
    res.status(500).json({ error: 'Error al listar trabajadores recientes', detalle: error.sqlMessage || error.message || error });
  }
};
