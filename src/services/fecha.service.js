import pool from '../config/db.js';

// Crear fecha de programación
export const crearFecha = async (fecha, subalmacen_id) => {
  const [result] = await pool.query(
    'INSERT INTO programacion_fechas (fecha, subalmacen_id, activo) VALUES (?, ?, 1)',
    [fecha, subalmacen_id]
  );
  return { id: result.insertId, fecha, subalmacen_id, activo: 1 };
};

// Listar todas las fechas
export const listarFechas = async () => {
  const [rows] = await pool.query('SELECT * FROM programacion_fechas ORDER BY fecha ASC');
  return rows;
};

// Obtener fecha por ID
export const obtenerFecha = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM programacion_fechas WHERE id = ?', [id]
  );
  return rows[0];
};

// Actualizar fecha
export const actualizarFecha = async (id, fecha, subalmacen_id, activo) => {
  const [result] = await pool.query(
    'UPDATE programacion_fechas SET fecha = ?, subalmacen_id = ?, activo = ? WHERE id = ?',
    [fecha, subalmacen_id, activo, id]
  );
  return result.affectedRows;
};

// Eliminar fecha (borrado físico)
export const eliminarFecha = async (id) => {
  // 1. Obtener la fecha y subalmacen_id
  const [rows] = await pool.query('SELECT fecha, subalmacen_id FROM programacion_fechas WHERE id = ?', [id]);
  if (rows.length === 0) return 0;
  const { fecha, subalmacen_id } = rows[0];

  // 2. Eliminar asistencias de ese subalmacén y fecha
  await pool.query(
    `DELETE a FROM asistencias a
     JOIN programacion_fechas pf ON a.programacion_fecha_id = pf.id
     WHERE pf.subalmacen_id = ? AND pf.fecha = ?`,
    [subalmacen_id, fecha]
  );

  // 3. Eliminar rotaciones de ese subalmacén y fecha
  await pool.query(
    'DELETE FROM rotaciones_trabajador WHERE subalmacen_id = ? AND fecha = ?',
    [subalmacen_id, fecha]
  );

  // 4. Eliminar la fecha
  const [result] = await pool.query(
    'DELETE FROM programacion_fechas WHERE id = ?', [id]
  );
  return result.affectedRows;
};

// Listar fechas por subalmacén
export const listarFechasPorSubalmacen = async (subalmacen_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM programacion_fechas WHERE subalmacen_id = ? ORDER BY fecha ASC',
    [subalmacen_id]
  );
  return rows;
};
