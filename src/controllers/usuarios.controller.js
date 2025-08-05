import * as UsuarioService from '../services/usuario.service.js';
import * as UsuarioAlmacenService from '../services/usuario_almacen.service.js';
import pool from '../config/db.js';

// Crear usuario y asociar almacenes/subalmacenes
export const crearUsuario = async (req, res) => {
  const { nombre, correo, password, rol_id, activo, ya_ingreso, almacenes } = req.body;
  // almacenes: array de objetos { subalmacen_id, limite_ingresos }
  if (!nombre || !correo || !password || !rol_id) {
    return res.status(400).json({ error: 'Nombre, correo, password y rol_id son requeridos' });
  }
  try {
    // 1. Crear usuario (ahora encripta automáticamente)
    const usuario = await UsuarioService.crearUsuario(
      nombre, correo, password, rol_id, activo, ya_ingreso
    );
    
    // 2. Asociar almacenes/subalmacenes solo si se envía el array y tiene elementos
    let relaciones = [];
    if (Array.isArray(almacenes) && almacenes.length > 0) {
      for (const a of almacenes) {
        if (!a.subalmacen_id || isNaN(Number(a.subalmacen_id))) {
          throw new Error('subalmacen_id inválido en el array almacenes');
        }
        const rel = await UsuarioAlmacenService.crearUsuarioAlmacen(
          usuario.id, a.subalmacen_id, a.limite_ingresos
        );
        relaciones.push(rel);
      }
    }
    
    // 📝 RESPUESTA CON CONTRASEÑA ORIGINAL PARA REFERENCIA
    const respuesta = {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
        activo: usuario.activo,
        ya_ingreso: usuario.ya_ingreso,
        password_para_login: usuario.password_original // ← Contraseña que debe usar para login
      },
      almacenes: relaciones,
      mensaje: `Usuario creado exitosamente. Contraseña para login: ${usuario.password_original}`
    };
    
    res.status(201).json(respuesta);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message, error.stack, req.body);
    res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
  }
};

// Listar todos los usuarios CON PERMISOS DE CONTRASEÑAS
export const listarUsuarios = async (req, res) => {
  try {
    // Obtener el rol del usuario que hace la solicitud
    const rolUsuario = req.usuario?.nombre_rol || req.usuario?.rol;
    
    let rows;
    if (['ADMINISTRACION', 'RRHH'].includes(rolUsuario)) {
      // ADMIN y RRHH pueden ver contraseñas originales
      rows = await UsuarioService.listarUsuariosConPasswords(rolUsuario);
    } else {
      // Otros roles solo ven información básica
      rows = await UsuarioService.listarUsuarios();
    }
    
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
export const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await UsuarioService.obtenerUsuario(req.params.id);
    if (!usuario)
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error('❌ Error al buscar usuario:', error.message);
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  const { nombre, correo, password, rol_id, activo, ya_ingreso } = req.body;
  try {
    const affectedRows = await UsuarioService.actualizarUsuario(
      req.params.id, nombre, correo, password, rol_id, activo, ya_ingreso
    );
    if (affectedRows === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error.message);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

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
