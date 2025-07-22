import pool from '../config/db.js';

// Crear una rotación
export const crearRotacion = async (trabajador_id, subalmacen_id, fecha) => {
  // Validar que no exista ya la rotación
  const [existe] = await pool.query(
    'SELECT id FROM rotaciones_trabajador WHERE trabajador_id = ? AND subalmacen_id = ? AND fecha = ?',
    [trabajador_id, subalmacen_id, fecha]
  );
  if (existe.length > 0) {
    throw new Error('Ya existe una rotación para ese trabajador, subalmacén y fecha');
  }
  const [result] = await pool.query(
    'INSERT INTO rotaciones_trabajador (trabajador_id, subalmacen_id, fecha) VALUES (?, ?, ?)',
    [trabajador_id, subalmacen_id, fecha]
  );
  return { id: result.insertId, trabajador_id, subalmacen_id, fecha };
};

// Listar rotaciones por subalmacén y fecha
export const listarRotaciones = async (subalmacen_id, fecha) => {
  let query = 'SELECT * FROM rotaciones_trabajador WHERE 1=1';
  const params = [];
  if (subalmacen_id) {
    query += ' AND subalmacen_id = ?';
    params.push(subalmacen_id);
  }
  if (fecha) {
    query += ' AND fecha = ?';
    params.push(fecha);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

// Eliminar una rotación
export const eliminarRotacion = async (id) => {
  const [result] = await pool.query('DELETE FROM rotaciones_trabajador WHERE id = ?', [id]);
  return result.affectedRows;
};
