import * as UsuarioService from '../services/usuario.service.js';
import * as UsuarioAlmacenService from '../services/usuario_almacen.service.js';
import pool from '../config/db.js';

// ...otros controladores...

// Eliminar usuario (con borrado en cascada manual)
export const eliminarUsuario = async (req, res) => {
  const usuarioId = req.params.id;
  try {
    // 1. Eliminar usuario_almacenes relacionados
    await pool.query('DELETE FROM usuario_almacenes WHERE usuario_id = ?', [usuarioId]);
    // 2. Eliminar trabajadores donde sea coordinador
    await pool.query('DELETE FROM trabajadores WHERE coordinador_id = ?', [usuarioId]);
    // 3. Eliminar asistencias donde sea responsable (registrado_por)
    await pool.query('DELETE FROM asistencias WHERE registrado_por = ?', [usuarioId]);
    // 4. Eliminar usuario
    const affectedRows = await UsuarioService.eliminarUsuario(usuarioId);
    if (affectedRows === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error.message);
    res.status(500).json({ error: 'Error al eliminar usuario', detalle: error.message });
  }
};

// ...otros controladores...
