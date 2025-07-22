import * as HorasFaltantesService from '../../services/dashboard/horasFaltantes.service.js';

// Endpoint para obtener el ranking de trabajadores con horas faltantes
export const obtenerHorasFaltantes = async (req, res) => {
  try {
    const rows = await HorasFaltantesService.obtenerHorasFaltantes();
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener horas faltantes:', error);
    res.status(500).json({ error: 'Error al listar trabajadores con horas faltantes' });
  }
};
