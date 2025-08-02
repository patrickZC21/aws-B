import pool from '../config/db.js';

// Listar trabajadores por subalmacen
export const listarTrabajadoresPorSubalmacen = async (subalmacen_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM trabajadores WHERE subalmacen_id = ? AND activo = 1',
    [subalmacen_id]
  );
  return rows;
};

// Listar trabajadores fijos y rotados por subalmacen y fecha
export const listarTrabajadoresPorSubalmacenYFecha = async (subalmacen_id, fecha) => {
  // Trabajadores fijos
  const [fijos] = await pool.query(
    'SELECT * FROM trabajadores WHERE subalmacen_id = ? AND activo = 1',
    [subalmacen_id]
  );
  // Trabajadores rotados
  const [rotados] = await pool.query(
    `SELECT t.* FROM rotaciones_trabajador r
     JOIN trabajadores t ON r.trabajador_id = t.id
     WHERE r.subalmacen_id = ? AND r.fecha = ? AND t.activo = 1`,
    [subalmacen_id, fecha]
  );
  // Unir y evitar duplicados (por si un trabajador fijo también está rotado)
  const todos = [...fijos];
  for (const rot of rotados) {
    if (!todos.some(f => f.id === rot.id)) {
      todos.push(rot);
    }
  }
  return todos;
};
