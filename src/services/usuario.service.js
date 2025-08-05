import pool from '../config/db.js';
import { encriptarPassword } from '../utils/password.helper.js';

// Crear usuario CON ENCRIPTACIÓN AUTOMÁTICA Y GUARDAR PASSWORD ORIGINAL
export const crearUsuario = async (nombre, correo, password, rol_id, activo, ya_ingreso) => {
  // ⚡ ENCRIPTAR CONTRASEÑA AUTOMÁTICAMENTE
  const passwordEncriptada = await encriptarPassword(password);
  
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, correo, password, rol_id, activo, ya_ingreso) VALUES (?, ?, ?, ?, ?, ?)',
    [
      nombre,
      correo,
      passwordEncriptada, // ← Usamos la contraseña encriptada
      rol_id,
      activo !== undefined ? activo : 1,
      ya_ingreso !== undefined ? ya_ingreso : 0,
    ]
  );
  
  // 🔐 GUARDAR CONTRASEÑA ORIGINAL PARA ADMIN/RRHH
  try {
    await pool.query(
      'INSERT INTO passwords_admin (usuario_id, password_original) VALUES (?, ?)',
      [result.insertId, password]
    );
  } catch (err) {
    console.warn('⚠️ No se pudo guardar password original:', err.message);
  }
  
  // 📝 RETORNAR TAMBIÉN LA CONTRASEÑA ORIGINAL (solo para logging/debug)
  return {
    id: result.insertId,
    nombre,
    correo,
    password_original: password, // ← Para que sepas cuál pusiste
    rol_id,
    activo: activo !== undefined ? activo : 1,
    ya_ingreso: ya_ingreso !== undefined ? ya_ingreso : 0,
  };
};

// Listar todos los usuarios CON CONTRASEÑAS ORIGINALES (solo para ADMIN/RRHH)
export const listarUsuariosConPasswords = async (rolUsuarioSolicitante) => {
  const [rows] = await pool.query(`
    SELECT u.id, u.nombre, u.correo, u.rol_id, u.activo, u.ya_ingreso, r.nombre AS nombre_rol,
           p.password_original
    FROM usuarios u
    LEFT JOIN roles r ON u.rol_id = r.id
    LEFT JOIN passwords_admin p ON u.id = p.usuario_id
  `);
  
  // Solo mostrar contraseñas reales si el solicitante es ADMIN o RRHH
  const puedeVerPasswords = ['ADMINISTRACION', 'RRHH'].includes(rolUsuarioSolicitante);
  
  return rows.map(user => ({
    ...user,
    password_info: puedeVerPasswords ? 
      (user.password_original || '123456') : 
      (user.id <= 6 ? '123456' : 'Personalizada'),
    password_hint: puedeVerPasswords ? 
      'Contraseña real para login' : 
      (user.id <= 6 ? 'Contraseña estándar' : 'Contraseña asignada al crear'),
    can_see_password: puedeVerPasswords
  }));
};

// Listar todos los usuarios (SIN MOSTRAR CONTRASEÑAS) - Para otros roles
export const listarUsuarios = async () => {
  const [rows] = await pool.query(`
    SELECT u.id, u.nombre, u.correo, u.rol_id, u.activo, u.ya_ingreso, r.nombre AS nombre_rol
    FROM usuarios u
    LEFT JOIN roles r ON u.rol_id = r.id
  `);
  
  // ⚡ AGREGAR INFORMACIÓN ÚTIL EN LUGAR DE CONTRASEÑA
  return rows.map(user => ({
    ...user,
    password_info: user.id <= 6 ? '123456' : 'Personalizada', // Info útil para el admin
    password_hint: user.id <= 6 ? 'Contraseña estándar' : 'Contraseña asignada al crear',
    can_see_password: false
  }));
};

// Obtener usuario por ID
export const obtenerUsuario = async (id) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0];
};

// Actualizar usuario CON ENCRIPTACIÓN AUTOMÁTICA Y GUARDAR PASSWORD ORIGINAL
export const actualizarUsuario = async (id, nombre, correo, password, rol_id, activo, ya_ingreso) => {
  let passwordFinal = password;
  
  // ⚡ ENCRIPTAR CONTRASEÑA SI SE PROPORCIONA UNA NUEVA
  if (password && !password.startsWith('$2b$')) {
    // Solo encriptar si no está ya encriptada
    passwordFinal = await encriptarPassword(password);
    
    // 🔐 ACTUALIZAR CONTRASEÑA ORIGINAL PARA ADMIN/RRHH
    try {
      await pool.query(
        'INSERT INTO passwords_admin (usuario_id, password_original) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_original = ?',
        [id, password, password]
      );
    } catch (err) {
      console.warn('⚠️ No se pudo actualizar password original:', err.message);
    }
  }
  
  const [result] = await pool.query(
    'UPDATE usuarios SET nombre = ?, correo = ?, password = ?, rol_id = ?, activo = ?, ya_ingreso = ? WHERE id = ?',
    [
      nombre,
      correo,
      passwordFinal, // ← Usamos la contraseña encriptada o la existente
      rol_id,
      activo !== undefined ? activo : 1,
      ya_ingreso !== undefined ? ya_ingreso : 0,
      id,
    ]
  );
  return result.affectedRows;
};

// Eliminar usuario
export const eliminarUsuario = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM usuarios WHERE id = ?', [id]
  );
  return result.affectedRows;
};
