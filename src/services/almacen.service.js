// Importa la conexión a la base de datos desde la configuración
import pool from '../config/db.js';

/**
 * Crea un nuevo almacén en la base de datos
 * @param {string} nombre - Nombre del almacén
 * @param {string} descripcion - Descripción del almacén
 * @returns {object} - Objeto con los datos del almacén creado
 */
export const crearAlmacen = async (nombre, descripcion) => {
  // Ejecuta el INSERT en la tabla almacenes
  const [result] = await pool.query(
    'INSERT INTO almacenes (nombre, descripcion) VALUES (?, ?)',
    [nombre, descripcion]
  );
  // Retorna el nuevo almacén creado (id, nombre y descripción)
  return { id: result.insertId, nombre, descripcion };
};

/**
 * Lista todos los almacenes de la base de datos
 * @returns {Array} - Lista de almacenes
 */
export const listarAlmacenes = async () => {
  // Ejecuta el SELECT para obtener todos los almacenes
  const [rows] = await pool.query('SELECT * FROM almacenes');
  return rows;
};

/**
 * Lista solo los almacenes donde el usuario tiene subalmacenes asignados
 * @param {number} userId - ID del usuario coordinador
 * @returns {Array} - Lista de almacenes
 */
export const listarAlmacenesAsignados = async (userId) => {
  const [rows] = await pool.query(`
    SELECT DISTINCT a.id, a.nombre
    FROM almacenes a
    JOIN subalmacenes s ON s.almacen_id = a.id
    JOIN usuario_subalmacen us ON us.subalmacen_id = s.id
    WHERE us.usuario_id = ?
  `, [userId]);
  return rows;
};

/**
 * Obtiene un almacén por su ID
 * @param {number} id - ID del almacén a buscar
 * @returns {object|null} - Objeto almacén o null si no existe
 */
export const obtenerAlmacen = async (id) => {
  // Busca el almacén con el ID especificado
  const [rows] = await pool.query(
    'SELECT * FROM almacenes WHERE id = ?', [id]
  );
  // Retorna el primer resultado o undefined si no existe
  return rows[0];
};

/**
 * Actualiza un almacén existente
 * @param {number} id - ID del almacén a actualizar
 * @param {string} nombre - Nuevo nombre del almacén
 * @param {string} descripcion - Nueva descripción del almacén
 * @returns {number} - Número de filas afectadas (0 si no se encontró)
 */
export const actualizarAlmacen = async (id, nombre, descripcion) => {
  // Ejecuta el UPDATE en la tabla almacenes
  const [result] = await pool.query(
    'UPDATE almacenes SET nombre = ?, descripcion = ? WHERE id = ?',
    [nombre, descripcion, id]
  );
  // Retorna el número de filas afectadas
  return result.affectedRows;
};

/**
 * Verifica si un almacén puede ser eliminado (no tiene subalmacenes ni asistencias)
 * @param {number} id - ID del almacén a verificar
 * @returns {object} - Objeto con resultado de validación
 */
export const verificarEliminacionAlmacen = async (id) => {
  // Verificar si tiene subalmacenes
  const [subalmacenes] = await pool.query(
    'SELECT COUNT(*) as count FROM subalmacenes WHERE almacen_id = ?', [id]
  );
  
  if (subalmacenes[0].count > 0) {
    return {
      puedeEliminar: false,
      razon: 'No se puede eliminar el almacén porque tiene subalmacenes asociados'
    };
  }

  // Verificar si tiene asistencias asociadas a través de subalmacenes
  const [asistencias] = await pool.query(`
    SELECT COUNT(*) as count 
    FROM asistencias a 
    JOIN subalmacenes s ON a.subalmacen_id = s.id 
    WHERE s.almacen_id = ?
  `, [id]);
  
  if (asistencias[0].count > 0) {
    return {
      puedeEliminar: false,
      razon: 'No se puede eliminar el almacén porque tiene asistencias registradas'
    };
  }

  return {
    puedeEliminar: true,
    razon: null
  };
};

/**
 * Elimina un almacén por su ID (con validaciones)
 * @param {number} id - ID del almacén a eliminar
 * @returns {number} - Número de filas afectadas (0 si no se encontró)
 * @throws {Error} - Si no se puede eliminar por restricciones
 */
export const eliminarAlmacen = async (id) => {
  // Verificar si se puede eliminar
  const validacion = await verificarEliminacionAlmacen(id);
  
  if (!validacion.puedeEliminar) {
    throw new Error(validacion.razon);
  }

  // Ejecuta el DELETE en la tabla almacenes
  const [result] = await pool.query(
    'DELETE FROM almacenes WHERE id = ?', [id]
  );
  // Retorna el número de filas afectadas
  return result.affectedRows;
};

/**
 * Lista solo los subalmacenes asignados a un usuario dentro de un almacén específico
 * @param {number} userId - ID del usuario coordinador
 * @param {number} almacenId - ID del almacén
 * @returns {Array} - Lista de subalmacenes
 */
export const listarSubalmacenesAsignados = async (userId, almacenId) => {
  const [rows] = await pool.query(`
    SELECT s.id, s.nombre
    FROM subalmacenes s
    JOIN usuario_almacenes ua ON ua.subalmacen_id = s.id
    WHERE ua.usuario_id = ? AND s.almacen_id = ?
  `, [userId, almacenId]);
  return rows;
};
