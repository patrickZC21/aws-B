import * as RotacionService from '../services/rotacion.service.js';
import * as AsistenciaService from '../services/asistencia.service.js';
import pool from '../config/db.js';
import notificationService from '../services/notification.service.js';

// Crear una rotación de trabajador
export const crearRotacion = async (req, res) => {
  const { trabajador_id, subalmacen_id, fecha } = req.body;
  if (!trabajador_id || !subalmacen_id || !fecha) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    // 1. Crear la rotación
    const result = await RotacionService.crearRotacion(trabajador_id, subalmacen_id, fecha);

    // 2. Buscar programacion_fecha_id
    const [fechas] = await pool.query(
      'SELECT id FROM programacion_fechas WHERE fecha = ? AND subalmacen_id = ?',
      [fecha, subalmacen_id]
    );
    let programacion_fecha_id = fechas.length > 0 ? fechas[0].id : null;
    if (!programacion_fecha_id) {
      // Si no existe, crearla
      const [inserted] = await pool.query(
        'INSERT INTO programacion_fechas (fecha, subalmacen_id, activo) VALUES (?, ?, 1)',
        [fecha, subalmacen_id]
      );
      programacion_fecha_id = inserted.insertId;
    }

    // 3. Crear la asistencia (registrado_por: 1 por defecto, justificacion: 'Sin novedades')
    await AsistenciaService.crearAsistencia({
      trabajador_id,
      subalmacen_id,
      hora_entrada: '00:00',
      hora_salida: '00:00',
      justificacion: 'Sin novedades',
      registrado_por: 1, // O puedes obtener el usuario real si lo tienes
      programacion_fecha_id
    });

    // 4. Notificar cambio a través de SSE
    try {
      notificationService.notifyAsistenciaChange(subalmacen_id, fecha, 'create');
    } catch (error) {
      console.error('Error notificando cambio:', error);
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al crear rotación' });
  }
};

// Listar rotaciones por subalmacén y fecha
export const listarRotaciones = async (req, res) => {
  const { subalmacen_id, fecha } = req.query;
  try {
    const rotaciones = await RotacionService.listarRotaciones(subalmacen_id, fecha);
    res.json(rotaciones);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al listar rotaciones' });
  }
};

// Eliminar una rotación
export const eliminarRotacion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await RotacionService.eliminarRotacion(id);
    res.json({ mensaje: 'Rotación eliminada', result });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al eliminar rotación' });
  }
};
