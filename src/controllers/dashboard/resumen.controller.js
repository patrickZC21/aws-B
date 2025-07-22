import { obtenerResumenDashboard as obtenerResumenService } from '../../services/dashboard/resumen.service.js';

export const obtenerResumenDashboard = async (req, res) => {
  const requestId = `dashboardController_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.time(requestId);
  try {
    const resumen = await obtenerResumenService();
    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener el resumen del dashboard' });
  } finally {
    console.timeEnd(requestId);
  }
};
