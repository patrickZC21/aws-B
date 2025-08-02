import * as ExportService from '../services/export.service.js';

// Endpoint para exportar asistencias por trabajador
export const exportarAsistenciasPorTrabajador = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    const result = await ExportService.exportarAsistenciasPorTrabajador(id, fecha_inicio, fecha_fin);

    if (result?.error) {
      return res.status(result.code).json({ error: result.error });
    }

    res.setHeader('Content-Disposition', `attachment; filename=asistencias_trabajador_${id}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(result);
  } catch (error) {
    console.error('❌ Error al exportar asistencias:', error.message);
    res.status(500).json({
      error: 'Ocurrió un error al generar el archivo Excel. Inténtelo nuevamente.'
    });
  }
};

// Endpoint para exportar fechas seleccionadas
export const exportarFechasSeleccionadas = async (req, res) => {
  try {
    const { fechas, subalmacen } = req.query;

    if (!fechas) {
      return res.status(400).json({ error: 'No se proporcionaron fechas para exportar' });
    }

    const fechasArray = fechas.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (fechasArray.length === 0) {
      return res.status(400).json({ error: 'No se encontraron fechas válidas para exportar' });
    }

    const result = await ExportService.exportarFechasSeleccionadas(fechasArray, subalmacen);

    if (result?.error) {
      return res.status(result.code).json({ error: result.error });
    }

    const filename = `fechas_subalmacen_${subalmacen || 'general'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(result);
  } catch (error) {
    console.error('❌ Error al exportar fechas:', error.message);
    res.status(500).json({
      error: 'Ocurrió un error al generar el archivo Excel. Inténtelo nuevamente.'
    });
  }
};
