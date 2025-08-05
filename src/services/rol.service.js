import pool from '../config/db.js';

// Crear rol
export const crearRol = async (nombre) => {
  const [result] = await pool.query(
    'INSERT INTO roles (nombre) VALUES (?)',
    [nombre]
  );
  return { id: result.insertId, nombre };
};

// Listar roles
export const listarRoles = async () => {
  const [rows] = await pool.query('SELECT * FROM roles');
  return rows;
};

// Obtener rol por ID
export const obtenerRol = async (id) => {
  const [rows] = await pool.query('SELECT * FROM roles WHERE id = ?', [id]);
  return rows[0];
};

// Actualizar rol
export const actualizarRol = async (id, nombre) => {
  const [result] = await pool.query(
    'UPDATE roles SET nombre = ? WHERE id = ?',
    [nombre, id]
  );
  return result.affectedRows;
};

// Eliminar rol
export const eliminarRol = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM roles WHERE id = ?', [id]
  );
  return result.affectedRows;
};
