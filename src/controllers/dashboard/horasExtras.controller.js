import * as HorasExtrasService from '../../services/dashboard/horasExtras.service.js';

// Endpoint para obtener el ranking de horas extras
export const obtenerHorasExtras = async (req, res) => {
  try {
    const rows = await HorasExtrasService.obtenerHorasExtras();
    res.json(rows);
  } catch (error) {
    console.error('Error al calcular horas extras:', error);
    // Enviar el error SQL real si existe
    res.status(500).json({ error: 'Error al listar horas extras', detalle: error.sqlMessage || error.message || error });
  }
};
