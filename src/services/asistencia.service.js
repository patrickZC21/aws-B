import pool from '../config/db.js';

// Crear nueva asistencia
export const crearAsistencia = async (datos) => {
  const {
    trabajador_id,
    subalmacen_id,
    hora_entrada = null,
    hora_salida = null,
    justificacion,
    registrado_por,
    programacion_fecha_id
  } = datos;

  // Verificar duplicado
  const [existe] = await pool.query(
    `SELECT id FROM asistencias WHERE trabajador_id = ? AND programacion_fecha_id = ?`,
    [trabajador_id, programacion_fecha_id]
  );
  if (existe.length > 0) {
    // Ignorar el duplicado y retornar éxito idempotente
    return { id: existe[0].id, mensaje: 'Asistencia ya registrada previamente' };
  }

  const [result] = await pool.query(
    `INSERT INTO asistencias (trabajador_id, subalmacen_id, hora_entrada, hora_salida, justificacion, registrado_por, programacion_fecha_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [trabajador_id, subalmacen_id, hora_entrada, hora_salida, justificacion ?? null, registrado_por, programacion_fecha_id]
  );
  return { id: result.insertId, mensaje: 'Asistencia registrada correctamente' };
};

// Listar asistencias con filtros (incluyendo filtro para coordinadores)
export const listarAsistencias = async (filtros = {}) => {
  const startTime = performance.now();
  console.log('[AsistenciaService] Filtros recibidos:', filtros);
  
  // Query optimizada con JOIN más eficiente
  let query = `
    SELECT 
      a.id,
      a.trabajador_id,
      a.subalmacen_id, 
      a.hora_entrada,
      a.hora_salida,
      a.justificacion,
      a.registrado_por,
      a.programacion_fecha_id,
      t.nombre AS trabajador_nombre, 
      t.dni AS trabajador_dni, 
      u.nombre AS registrado_por_nombre,
      s.nombre AS subalmacen_nombre,
      al.nombre AS almacen_nombre
    FROM asistencias a
    FORCE INDEX (idx_asistencias_lookup)
    INNER JOIN trabajadores t ON a.trabajador_id = t.id
    INNER JOIN usuarios u ON a.registrado_por = u.id
    INNER JOIN subalmacenes s ON a.subalmacen_id = s.id
    INNER JOIN almacenes al ON s.almacen_id = al.id
    WHERE 1=1
  `;
  const params = [];

  if (filtros.programacion_fecha_id) {
    query += ' AND a.programacion_fecha_id = ?';
    params.push(filtros.programacion_fecha_id);
  }
  if (filtros.subalmacen_id) {
    query += ' AND a.subalmacen_id = ?';
    params.push(filtros.subalmacen_id);
  }
  
  // Filtro especial para coordinadores: permitir múltiples subalmacenes
  if (filtros.subalmacenes_permitidos && filtros.subalmacenes_permitidos.length > 0) {
    const placeholders = filtros.subalmacenes_permitidos.map(() => '?').join(',');
    query += ` AND a.subalmacen_id IN (${placeholders})`;
    params.push(...filtros.subalmacenes_permitidos);
  }

  // Agregar ORDER BY para optimizar la consulta
  query += ' ORDER BY a.id DESC';

  try {
    const [rows] = await pool.query(query, params);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    console.log(`[AsistenciaService] Consulta completada en ${duration}ms - ${rows.length} registros`);
    
    if (duration > 1000) {
      console.warn(`[AsistenciaService] Consulta lenta detectada: ${duration}ms`);
    }
    
    return rows;
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.error(`[AsistenciaService] Error en consulta después de ${duration}ms:`, error);
    throw error;
  }
};

// Obtener asistencia por ID
export const obtenerAsistencia = async (id) => {
  const [rows] = await pool.query('SELECT * FROM asistencias WHERE id = ?', [id]);
  return rows[0];
};

// Actualizar asistencia - Optimizada
export const actualizarAsistencia = async (id, datos) => {
  // Validar que el ID sea numérico
  if (!id || isNaN(id)) {
    throw new Error('ID de asistencia inválido');
  }

  // Solo actualizar los campos enviados (para edición inline)
  const campos = [];
  const valores = [];
  
  // Solo procesar campos permitidos para edición inline
  const camposPermitidos = ['hora_entrada', 'hora_salida', 'justificacion'];
  
  for (const campo of camposPermitidos) {
    if (campo in datos) {
      campos.push(`${campo} = ?`);
      valores.push(datos[campo] ?? null);
    }
  }
  
  // Si no hay campos para actualizar, retornar sin hacer nada
  if (campos.length === 0) {
    console.log('[actualizarAsistencia] No hay campos para actualizar');
    return 0;
  }

  // Agregar timestamp de actualización
  campos.push('updated_at = NOW()');
  
  const sql = `UPDATE asistencias SET ${campos.join(', ')} WHERE id = ? LIMIT 1`;
  valores.push(id);
  
  console.log('[actualizarAsistencia] Ejecutando:', sql, valores);
  
  const [result] = await pool.query(sql, valores);
  return result.affectedRows;
};

// Eliminar asistencia
export const eliminarAsistencia = async (id) => {
  try {
    console.log('[eliminarAsistencia] Buscando asistencia id:', id);
    const [rows] = await pool.query('SELECT * FROM asistencias WHERE id = ?', [id]);
    if (rows.length === 0) {
      console.log('[eliminarAsistencia] No se encontró la asistencia');
      return 0;
    }
    const asistencia = rows[0];
    let fecha = null;
    if (asistencia.programacion_fecha_id) {
      const [fechas] = await pool.query('SELECT fecha FROM programacion_fechas WHERE id = ?', [asistencia.programacion_fecha_id]);
      if (fechas.length > 0) fecha = fechas[0].fecha;
      console.log('[eliminarAsistencia] Fecha encontrada:', fecha);
    }
    const [result] = await pool.query('DELETE FROM asistencias WHERE id = ?', [id]);
    console.log('[eliminarAsistencia] Asistencia eliminada:', result.affectedRows);
    if (fecha) {
      const [rotResult] = await pool.query(
        'DELETE FROM rotaciones_trabajador WHERE trabajador_id = ? AND subalmacen_id = ? AND fecha = ?',
        [asistencia.trabajador_id, asistencia.subalmacen_id, fecha]
      );
      console.log('[eliminarAsistencia] Rotación eliminada:', rotResult.affectedRows);
    }
    return result.affectedRows;
  } catch (error) {
    console.error('[eliminarAsistencia] ERROR:', error);
    throw error;
  }
};

// Crear múltiples asistencias de manera optimizada
export const crearMultiplesAsistencias = async (asistenciasData) => {
  if (!asistenciasData || asistenciasData.length === 0) {
    return { creadas: 0, errores: [] };
  }

  const errores = [];
  const asistenciasValidas = [];

  // Verificar duplicados en lote
  const verificacionPromesas = asistenciasData.map(async (datos) => {
    try {
      const [existe] = await pool.query(
        `SELECT id FROM asistencias WHERE trabajador_id = ? AND programacion_fecha_id = ?`,
        [datos.trabajador_id, datos.programacion_fecha_id]
      );
      
      if (existe.length === 0) {
        asistenciasValidas.push(datos);
      }
    } catch (error) {
      errores.push({ 
        trabajador_id: datos.trabajador_id, 
        error: error.message 
      });
    }
  });

  await Promise.all(verificacionPromesas);

  if (asistenciasValidas.length === 0) {
    return { creadas: 0, errores, mensaje: 'Todas las asistencias ya existían' };
  }

  // Construir INSERT masivo
  const values = asistenciasValidas.map(datos => [
    datos.trabajador_id,
    datos.subalmacen_id,
    datos.hora_entrada || null,
    datos.hora_salida || null,
    datos.justificacion || null,
    datos.registrado_por,
    datos.programacion_fecha_id
  ]);

  const placeholders = asistenciasValidas.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
  const flatValues = values.flat();

  try {
    const [result] = await pool.query(
      `INSERT INTO asistencias (trabajador_id, subalmacen_id, hora_entrada, hora_salida, justificacion, registrado_por, programacion_fecha_id) 
       VALUES ${placeholders}`,
      flatValues
    );

    return {
      creadas: result.affectedRows,
      errores,
      mensaje: `${result.affectedRows} asistencias creadas exitosamente`
    };
  } catch (error) {
    console.error('Error en INSERT masivo de asistencias:', error);
    throw error;
  }
};
