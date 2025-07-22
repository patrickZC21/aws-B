import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { compararPassword } from '../utils/password.helper.js';
import { logger } from '../utils/logger.js';

// Servicio para validar usuario y generar token (LOGS LIMPIOS)
export const login = async (correo, contraseña) => {
  try {
    // ⚡ Consulta optimizada
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.password, u.rol_id, u.ya_ingreso, r.nombre as nombre_rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.correo = ? AND u.activo = 1 LIMIT 1`,
      [correo]
    );
    
    const usuario = rows[0];
    if (!usuario) {
      return { error: 'Credenciales inválidas', code: 401 };
    }

    // Verificar sesión activa
    if (usuario.ya_ingreso === 1) {
      return { 
        error: 'Esta cuenta ya está siendo utilizada en otro dispositivo. Solo se permite una sesión activa por usuario.', 
        code: 409 
      };
    }

    // Verificar contraseña
    const passwordValida = await compararPassword(contraseña, usuario.password);
    if (!passwordValida) {
      return { error: 'Credenciales inválidas', code: 401 };
    }

    // Generar token
    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol_id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        nombre_rol: usuario.nombre_rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Update asíncrono no bloqueante
    setImmediate(() => {
      pool.query('UPDATE usuarios SET ya_ingreso = 1 WHERE id = ?', [usuario.id])
        .catch(err => logger.error('Error en update ya_ingreso:', err));
    });

    logger.dev(`Login exitoso: ${correo}`);

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol_id,
        nombre_rol: usuario.nombre_rol
      }
    };
  } catch (error) {
    logger.error('Error en login:', error);
    return { error: 'Error interno del servidor', code: 500 };
  }
};

// ✅ Servicio para logout - marcar usuario como desconectado
export const logout = async (userId) => {
  try {
    await pool.query(
      'UPDATE usuarios SET ya_ingreso = 0 WHERE id = ?',
      [userId]
    );
    return { success: true };
  } catch (error) {
    console.error('❌ Error en logout:', error);
    return { error: 'Error al cerrar sesión', code: 500 };
  }
};

// ✅ Servicio para forzar desconexión de usuario (para admins)
export const forzarDesconexion = async (userId) => {
  try {
    await pool.query(
      'UPDATE usuarios SET ya_ingreso = 0 WHERE id = ?',
      [userId]
    );
    return { success: true, message: 'Usuario desconectado exitosamente' };
  } catch (error) {
    console.error('❌ Error al forzar desconexión:', error);
    return { error: 'Error al forzar desconexión', code: 500 };
  }
};

// ✅ Servicio para forzar logout por correo (para resolver conflictos de sesión)
export const forzarLogoutPorCorreo = async (correo) => {
  try {
    const [result] = await pool.query(
      'UPDATE usuarios SET ya_ingreso = 0 WHERE correo = ?',
      [correo]
    );
    
    if (result.affectedRows === 0) {
      return { error: 'Usuario no encontrado', code: 404 };
    }
    
    return { success: true, message: 'Sesión anterior cerrada exitosamente' };
  } catch (error) {
    console.error('❌ Error al forzar logout por correo:', error);
    return { error: 'Error al cerrar sesión anterior', code: 500 };
  }
};
