import pool from '../config/db.js'; // <--- AGREGA ESTA LÍNEA AL INICIO
import * as AsistenciaService from '../services/asistencia.service.js';
import * as UsuarioService from '../services/usuario.service.js'; // Asegúrate de importar el servicio
import notificationService from '../services/notification.service.js';

// Crear nueva asistencia
export const crearAsistencia = async (req, res) => {
  const datos = req.body;
  // Validar campos obligatorios (excepto hora_entrada y hora_salida)
  const required = ['trabajador_id', 'subalmacen_id', 'registrado_por', 'programacion_fecha_id'];
  for (const campo of required) {
    if (!datos[campo]) return res.status(400).json({ error: `El campo ${campo} es obligatorio` });
  }
  // Para nuevas asistencias, permitir que se creen sin horas (se pueden agregar después)
  // if (!('hora_entrada' in datos) && !('hora_salida' in datos)) {
  //   return res.status(400).json({ error: 'Debe enviar al menos hora_entrada o hora_salida' });
  // }
  try {
    // Validar que registrado_por sea coordinador (COMENTADO TEMPORALMENTE)
    const usuario = await UsuarioService.obtenerUsuario(datos.registrado_por);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    // if (usuario.rol_id !== 3) {
    //   return res.status(403).json({ error: 'Solo los coordinadores pueden registrar asistencias.' });
    //    }
    const result = await AsistenciaService.crearAsistencia(datos);
    if (result.error) return res.status(result.code).json({ error: result.error });
    
    // Notificar cambio a través de SSE
    try {
      // Obtener la fecha de la programación
      const [fechaRows] = await pool.query(
        'SELECT fecha FROM programacion_fechas WHERE id = ?',
        [datos.programacion_fecha_id]
      );
      const fecha = fechaRows[0]?.fecha;
      if (fecha) {
        notificationService.notifyAsistenciaChange(datos.subalmacen_id, fecha, 'create');
      }
    } catch (error) {
      console.error('Error notificando cambio:', error);
    }
    
    res.status(201).json({ id: result.id, mensaje: 'Asistencia registrada correctamente' });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
};

// Listar todas las asistencias
export const listarAsistencias = async (req, res) => {
  const startTime = performance.now();
  const { programacion_fecha_id, subalmacen_id, fecha } = req.query;
  
  console.log('[AsistenciasController] Solicitud recibida:', {
    programacion_fecha_id,
    subalmacen_id,
    fecha,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  try {
    let finalProgramacionFechaId = programacion_fecha_id;
    
    if (!programacion_fecha_id && fecha) {
      // Buscar el id de la fecha
      const [rows] = await pool.query(
        'SELECT id FROM programacion_fechas WHERE fecha = ? AND subalmacen_id = ?',
        [fecha, subalmacen_id]
      );
      console.log('[AsistenciasController] Búsqueda programacion_fechas:', {
        fecha,
        subalmacen_id,
        resultados: rows.length
      });
      
      if (rows.length > 0) {
        finalProgramacionFechaId = rows[0].id;
        console.log('[AsistenciasController] ID de programación encontrado:', finalProgramacionFechaId);
      }
    }
    
    const filtros = {};
    if (finalProgramacionFechaId) filtros.programacion_fecha_id = finalProgramacionFechaId;
    if (subalmacen_id) filtros.subalmacen_id = subalmacen_id;

    const asistencias = await AsistenciaService.listarAsistencias(filtros);
    
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    console.log(`[AsistenciasController] Respuesta enviada en ${duration}ms - ${asistencias.length} registros`);
    
    if (duration > 2000) {
      console.warn(`[AsistenciasController] Respuesta lenta detectada: ${duration}ms`);
    }
    
    res.json(asistencias);
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    console.error(`[AsistenciasController] Error después de ${duration}ms:`, {
      message: error.message,
      stack: error.stack,
      filtros: { programacion_fecha_id, subalmacen_id, fecha }
    });
    
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};

// Obtener asistencia por ID
export const obtenerAsistencia = async (req, res) => {
  try {
    const asistencia = await AsistenciaService.obtenerAsistencia(req.params.id);
    if (!asistencia) return res.status(404).json({ error: 'Asistencia no encontrada' });
    res.json(asistencia);
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
};

// Actualizar asistencia
export const actualizarAsistencia = async (req, res) => {
  try {
    const affectedRows = await AsistenciaService.actualizarAsistencia(req.params.id, req.body);
    if (affectedRows === 0) return res.status(404).json({ error: 'Asistencia no encontrada' });
    res.json({ mensaje: 'Asistencia actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
};

// Eliminar asistencia
export const eliminarAsistencia = async (req, res) => {
  try {
    const affectedRows = await AsistenciaService.eliminarAsistencia(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ error: 'Asistencia no encontrada' });
    res.json({ mensaje: 'Asistencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar asistencia:', error);
    res.status(500).json({ error: 'Error al eliminar asistencia' });
  }
};
