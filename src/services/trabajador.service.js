import pool from '../config/db.js';

// Crear trabajador
export const crearTrabajador = async (nombre, dni, subalmacen_id, coordinador_id, horas_objetivo) => {
  const [result] = await pool.query(
    'INSERT INTO trabajadores (nombre, dni, subalmacen_id, coordinador_id, horas_objetivo, activo) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, dni, subalmacen_id, coordinador_id || null, horas_objetivo ?? 0, 1]
  );
  return {
    id: result.insertId,
    nombre,
    dni,
    subalmacen_id,
    coordinador_id: coordinador_id || null,
    horas_objetivo: horas_objetivo ?? 0,
    activo: 1,
  };
};

// Listar todos los trabajadores
export const listarTrabajadores = async () => {
  const [rows] = await pool.query(`
    SELECT 
      t.id, 
      t.nombre, 
      t.dni, 
      t.activo,
      t.subalmacen_id,
      a.nombre AS almacen,
      s.nombre AS subalmacen,
      u.nombre AS coordinador,
      t.horas_objetivo
    FROM trabajadores t
    LEFT JOIN subalmacenes s ON t.subalmacen_id = s.id
    LEFT JOIN almacenes a ON s.almacen_id = a.id
    LEFT JOIN usuarios u ON t.coordinador_id = u.id
    ORDER BY t.nombre ASC
  `);
  return rows;
};

// Obtener trabajador por ID
export const obtenerTrabajador = async (id) => {
  const [rows] = await pool.query('SELECT * FROM trabajadores WHERE id = ?', [id]);
  return rows[0];
};

// Actualizar trabajador
export const actualizarTrabajador = async (id, nombre, dni, subalmacen_id, coordinador_id, horas_objetivo) => {
  const [result] = await pool.query(
    'UPDATE trabajadores SET nombre = ?, dni = ?, subalmacen_id = ?, coordinador_id = ?, horas_objetivo = ? WHERE id = ?',
    [nombre, dni, subalmacen_id, coordinador_id || null, horas_objetivo ?? 0, id]
  );
  return result.affectedRows;
};

// Eliminar trabajador
export const eliminarTrabajador = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM trabajadores WHERE id = ?', [id]
  );
  return result.affectedRows;
};

// Actualizar estado trabajador
export const actualizarEstadoTrabajador = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE trabajadores SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};
