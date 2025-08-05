import pool from '../config/db.js';

// Crear subalmacén
export const crearSubalmacen = async (nombre, almacen_id, refrigerio = null, jornada = null) => {
  const [result] = await pool.query(
    'INSERT INTO subalmacenes (nombre, almacen_id, refrigerio, jornada) VALUES (?, ?, ?, ?)',
    [nombre, almacen_id, refrigerio, jornada]
  );
  return { id: result.insertId, nombre, almacen_id, refrigerio, jornada };
};

// Listar subalmacenes
export const listarSubalmacenes = async () => {
  const [rows] = await pool.query('SELECT * FROM subalmacenes');
  return rows;
};

// Listar subalmacenes filtrados por almacen_id
export const listarSubalmacenesPorAlmacen = async (almacen_id) => {
  const [rows] = await pool.query('SELECT * FROM subalmacenes WHERE almacen_id = ?', [almacen_id]);
  return rows;
};

// Obtener subalmacén por ID
export const obtenerSubalmacen = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM subalmacenes WHERE id = ?', [id]
  );
  return rows[0];
};

// Obtener info de subalmacén y su almacén asociado
export const obtenerInfoSubalmacen = async (id) => {
  // Unir subalmacenes y almacenes para obtener toda la información incluyendo las nuevas columnas
  const [rows] = await pool.query(
    `SELECT s.nombre AS subalmacen, a.nombre AS almacen, s.refrigerio, s.jornada
     FROM subalmacenes s
     JOIN almacenes a ON s.almacen_id = a.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0];
};

// Actualizar subalmacén
export const actualizarSubalmacen = async (id, nombre, almacen_id, refrigerio = null, jornada = null) => {
  const [result] = await pool.query(
    'UPDATE subalmacenes SET nombre = ?, almacen_id = ?, refrigerio = ?, jornada = ? WHERE id = ?',
    [nombre, almacen_id, refrigerio, jornada, id]
  );
  return result.affectedRows;
};

// Eliminar subalmacén
export const eliminarSubalmacen = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM subalmacenes WHERE id = ?', [id]
  );
  return result.affectedRows;
};
