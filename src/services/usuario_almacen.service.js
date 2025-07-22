import pool from '../config/db.js';

// Crear acceso usuario-almacén
export const crearUsuarioAlmacen = async (usuario_id, subalmacen_id, limite_ingresos) => {
  try {
    console.log('🔄 crearUsuarioAlmacen - Params:', { usuario_id, subalmacen_id, limite_ingresos });
    const [result] = await pool.query(
      'INSERT INTO usuario_almacenes (usuario_id, subalmacen_id, limite_ingresos) VALUES (?, ?, ?)',
      [usuario_id, subalmacen_id, limite_ingresos ?? null]
    );
    console.log('✅ crearUsuarioAlmacen - Success:', { id: result.insertId });
    return { id: result.insertId, usuario_id, subalmacen_id, limite_ingresos };
  } catch (error) {
    console.error('❌ crearUsuarioAlmacen - Error:', error.message);
    console.error('❌ crearUsuarioAlmacen - SQL Error Code:', error.code);
    console.error('❌ crearUsuarioAlmacen - SQL Error Number:', error.errno);
    throw error;
  }
};

// Listar accesos SOLO con los campos requeridos
export const listarUsuarioAlmacenes = async () => {
  const [rows] = await pool.query(`
    SELECT 
      ua.id, ua.usuario_id, ua.subalmacen_id, ua.limite_ingresos,
      sa.nombre AS subalmacen_nombre,
      a.nombre AS almacen_nombre
    FROM usuario_almacenes ua
    LEFT JOIN subalmacenes sa ON ua.subalmacen_id = sa.id
    LEFT JOIN almacenes a ON sa.almacen_id = a.id
  `);
  return rows;
};

// Actualizar acceso
export const actualizarUsuarioAlmacen = async (id, usuario_id, subalmacen_id, limite_ingresos) => {
  const [result] = await pool.query(
    'UPDATE usuario_almacenes SET usuario_id = ?, subalmacen_id = ?, limite_ingresos = ? WHERE id = ?',
    [usuario_id, subalmacen_id, limite_ingresos ?? null, id]
  );
  return result.affectedRows;
};

// Eliminar acceso
export const eliminarUsuarioAlmacen = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM usuario_almacenes WHERE id = ?', [id]
  );
  return result.affectedRows;
};

// Obtener usuario-almacén por ID
export const obtenerUsuarioAlmacenPorId = async (id) => {
  const [rows] = await pool.query(
    `SELECT ua.*, a.nombre AS almacen_nombre, sa.nombre AS subalmacen_nombre
     FROM usuario_almacenes ua
     LEFT JOIN subalmacenes sa ON ua.subalmacen_id = sa.id
     LEFT JOIN almacenes a ON sa.almacen_id = a.id
     WHERE ua.id = ?`,
    [id]
  );
  return rows;
};
