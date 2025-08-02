import * as FechaService from '../services/fecha.service.js';
import * as TrabajadorExtraService from '../services/trabajador.extra.js';
import * as AsistenciaService from '../services/asistencia.service.js';

// Crear fecha de programación
export const crearFecha = async (req, res) => {
  const { fecha, subalmacen_id } = req.body;
  const usuarioId = req.usuario?.id; // <-- Cambiado a req.usuario
  console.log('➡️  Crear fecha para subalmacen_id:', subalmacen_id, 'fecha:', fecha, 'por usuario:', usuarioId);
  if (!fecha || !subalmacen_id) {
    return res.status(400).json({ error: 'Fecha y subalmacen_id son requeridos' });
  }
  if (!usuarioId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  try {
    console.log('⏱️ Creando fecha:', fecha, 'para subalmacen:', subalmacen_id);
    const startTime = performance.now();
    
    const result = await FechaService.crearFecha(fecha, subalmacen_id);
    
    // Obtener trabajadores fijos y rotados para esa fecha y subalmacén
    const trabajadores = await TrabajadorExtraService.listarTrabajadoresPorSubalmacenYFecha(subalmacen_id, fecha);
    console.log('👷‍♂️ Trabajadores encontrados (fijos+rotados):', trabajadores.length);
    
    // Preparar datos para INSERT masivo
    const asistenciasData = trabajadores.map(trabajador => ({
      trabajador_id: trabajador.id,
      subalmacen_id: subalmacen_id,
      hora_entrada: '00:00',
      hora_salida: '00:00',
      justificacion: 'Sin novedades',
      registrado_por: usuarioId,
      programacion_fecha_id: result.id
    }));

    // Crear todas las asistencias de una vez
    const resultadoAsistencias = await AsistenciaService.crearMultiplesAsistencias(asistenciasData);
    
    const endTime = performance.now();
    console.log(`✅ Fecha creada con ${resultadoAsistencias.creadas} asistencias en ${(endTime - startTime).toFixed(2)}ms`);
    
    if (resultadoAsistencias.errores && resultadoAsistencias.errores.length > 0) {
      return res.status(201).json({ ...result, errores: resultadoAsistencias.errores });
    }
    if (resultadoAsistencias.errores && resultadoAsistencias.errores.length > 0) {
      return res.status(201).json({ ...result, errores: resultadoAsistencias.errores });
    }
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error al crear fecha:', error);
    res.status(500).json({ error: error.message || 'Error al crear fecha' });
  }
};

// Listar todas las fechas
export const listarFechas = async (req, res) => {
  try {
    const { subalmacen_id } = req.query;
    let rows;
    if (subalmacen_id) {
      rows = await FechaService.listarFechasPorSubalmacen(subalmacen_id);
    } else {
      rows = await FechaService.listarFechas();
    }
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al listar fechas:', error.message);
    res.status(500).json({ error: 'Error al listar fechas' });
  }
};

// Obtener fecha por ID
export const obtenerFecha = async (req, res) => {
  try {
    const fecha = await FechaService.obtenerFecha(req.params.id);
    if (!fecha) return res.status(404).json({ error: 'Fecha no encontrada' });
    res.json(fecha);
  } catch (error) {
    console.error('❌ Error al buscar fecha:', error.message);
    res.status(500).json({ error: 'Error al buscar fecha' });
  }
};

// Actualizar fecha
export const actualizarFecha = async (req, res) => {
  const { fecha, subalmacen_id, activo } = req.body;
  try {
    const affectedRows = await FechaService.actualizarFecha(
      req.params.id, fecha, subalmacen_id, activo
    );
    if (affectedRows === 0) return res.status(404).json({ error: 'Fecha no encontrada' });
    res.json({ mensaje: 'Fecha actualizada' });
  } catch (error) {
    console.error('❌ Error al actualizar fecha:', error.message);
    res.status(500).json({ error: 'Error al actualizar fecha' });
  }
};

// Eliminar fecha (borrado físico)
export const eliminarFecha = async (req, res) => {
  try {
    const affectedRows = await FechaService.eliminarFecha(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ error: 'Fecha no encontrada' });
    res.json({ mensaje: 'Fecha eliminada' });
  } catch (error) {
    console.error('❌ Error al eliminar fecha:', error.message);
    res.status(500).json({ error: 'Error al eliminar fecha' });
  }
};

// Crear múltiples fechas de manera optimizada
export const crearMultiplesFechas = async (req, res) => {
  const { fechas, subalmacen_id } = req.body;
  const usuarioId = req.usuario?.id;
  
  console.log('⏱️ Crear múltiples fechas:', fechas?.length, 'fechas para subalmacen_id:', subalmacen_id);
  
  if (!fechas || !Array.isArray(fechas) || fechas.length === 0) {
    return res.status(400).json({ error: 'Debe proporcionar un array de fechas' });
  }
  if (!subalmacen_id) {
    return res.status(400).json({ error: 'subalmacen_id es requerido' });
  }
  if (!usuarioId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  try {
    const startTime = performance.now();
    const resultados = [];
    const errores = [];

    // Procesar todas las fechas en paralelo
    const promesas = fechas.map(async (fecha) => {
      try {
        const result = await FechaService.crearFecha(fecha, subalmacen_id);
        
        // Obtener trabajadores fijos y rotados para esa fecha y subalmacén
        const trabajadores = await TrabajadorExtraService.listarTrabajadoresPorSubalmacenYFecha(subalmacen_id, fecha);
        
        // Preparar datos para INSERT masivo optimizado
        const asistenciasData = trabajadores.map(trabajador => ({
          trabajador_id: trabajador.id,
          subalmacen_id: subalmacen_id,
          hora_entrada: '00:00',
          hora_salida: '00:00',
          justificacion: 'Sin novedades',
          registrado_por: usuarioId,
          programacion_fecha_id: result.id
        }));

        // Crear todas las asistencias de una vez (mucho más rápido)
        await AsistenciaService.crearMultiplesAsistencias(asistenciasData);
        return result;
        
      } catch (error) {
        console.error('❌ Error al crear fecha', fecha, error.message);
        return { error: error.message, fecha };
      }
    });

    const resultadosCompletos = await Promise.all(promesas);
    
    // Separar éxitos y errores
    resultadosCompletos.forEach(resultado => {
      if (resultado.error) {
        errores.push(resultado);
      } else {
        resultados.push(resultado);
      }
    });

    const endTime = performance.now();
    console.log(`✅ ${resultados.length} fechas creadas en ${(endTime - startTime).toFixed(2)}ms`);

    res.status(201).json({
      mensaje: `${resultados.length} fechas creadas exitosamente`,
      fechas_creadas: resultados,
      errores: errores.length > 0 ? errores : undefined
    });
    
  } catch (error) {
    console.error('❌ Error al crear múltiples fechas:', error);
    res.status(500).json({ error: error.message || 'Error al crear múltiples fechas' });
  }
};
