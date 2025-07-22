// controllers/permisos.controller.js
import pool from '../config/db.js';

/**
 * Obtener los accesos del usuario autenticado
 * @route GET /api/permisos/mis-accesos
 */
export const obtenerMisAccesos = async (req, res) => {
  try {
    const usuario = req.usuario;
    console.log('📋 Usuario solicitando permisos:', usuario.id, usuario.nombre, 'Rol ID:', usuario.rol);
    
    // Administradores tienen acceso a todo
    if (usuario.rol === 2) { // ADMINISTRACIÓN
      console.log('👑 Usuario es administrador, obteniendo todos los almacenes...');
      
      const [almacenes] = await pool.query(`
        SELECT id, nombre, descripcion, ubicacion 
        FROM almacenes 
        WHERE activo = 1 
        ORDER BY nombre
      `);
      
      const [subalmacenes] = await pool.query(`
        SELECT s.id, s.nombre, s.descripcion, s.almacen_id, a.nombre as almacen_nombre
        FROM subalmacenes s
        INNER JOIN almacenes a ON s.almacen_id = a.id
        WHERE s.activo = 1 
        ORDER BY a.nombre, s.nombre
      `);
      
      console.log(`✅ Administrador - ${almacenes.length} almacenes, ${subalmacenes.length} subalmacenes`);
      
      return res.json({
        success: true,
        data: {
          rol: 'administrador',
          almacenes: almacenes,
          subalmacenes: subalmacenes,
          acceso_total: true,
          total_almacenes: almacenes.length,
          total_subalmacenes: subalmacenes.length
        }
      });
    }
    
    // Coordinadores tienen acceso limitado
    if (usuario.rol === 3) { // COORDINADOR
      console.log('👔 Usuario es coordinador, obteniendo accesos específicos...');
      
      const [accesos] = await pool.query(`
        SELECT ua.*, s.nombre as subalmacen_nombre, s.descripcion as subalmacen_descripcion,
               a.id as almacen_id, a.nombre as almacen_nombre, a.descripcion as almacen_descripcion
        FROM usuario_almacenes ua
        INNER JOIN subalmacenes s ON ua.subalmacen_id = s.id
        INNER JOIN almacenes a ON s.almacen_id = a.id
        WHERE ua.usuario_id = ? AND s.activo = 1 AND a.activo = 1
        ORDER BY a.nombre, s.nombre
      `, [usuario.id]);
      
      console.log(`📊 Coordinador - ${accesos.length} accesos encontrados`);
      
      if (accesos.length === 0) {
        console.log('⚠️ Coordinador sin asignaciones');
        return res.json({
          success: true,
          data: {
            rol: 'coordinador',
            almacenes: [],
            subalmacenes: [],
            accesos_limitados: true,
            total_subalmacenes: 0,
            mensaje: 'No tienes asignaciones de almacenes/subalmacenes'
          }
        });
      }
      
      // Extraer almacenes únicos
      const almacenesMap = new Map();
      const subalmacenesConAcceso = [];
      
      accesos.forEach(acceso => {
        // Agregar almacén único
        if (!almacenesMap.has(acceso.almacen_id)) {
          almacenesMap.set(acceso.almacen_id, {
            id: acceso.almacen_id,
            nombre: acceso.almacen_nombre,
            descripcion: acceso.almacen_descripcion
          });
        }
        
        // Agregar subalmacén
        subalmacenesConAcceso.push({
          id: acceso.subalmacen_id,
          nombre: acceso.subalmacen_nombre,
          descripcion: acceso.subalmacen_descripcion,
          almacen_id: acceso.almacen_id,
          almacen_nombre: acceso.almacen_nombre
        });
      });
      
      const almacenesUnicos = Array.from(almacenesMap.values());
      
      console.log(`✅ Coordinador - ${almacenesUnicos.length} almacenes únicos, ${subalmacenesConAcceso.length} subalmacenes`);
      
      return res.json({
        success: true,
        data: {
          rol: 'coordinador',
          almacenes: almacenesUnicos,
          subalmacenes: subalmacenesConAcceso,
          accesos_limitados: true,
          total_subalmacenes: subalmacenesConAcceso.length
        }
      });
    }
    
    // Otros roles no tienen acceso
    console.log(`❌ Rol ${usuario.rol} no tiene acceso a almacenes`);
    return res.status(403).json({ 
      success: false,
      error: 'Solo administradores y coordinadores pueden acceder a esta funcionalidad' 
    });
    
  } catch (error) {
    console.error('❌ Error al obtener accesos del usuario:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

/**
 * Verificar si el usuario tiene acceso a un subalmacén específico
 * @route GET /api/permisos/verificar-acceso/:subalmacen_id
 */
export const verificarAccesoSubalmacen = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { subalmacen_id } = req.params;
    
    console.log(`🔍 Verificando acceso de usuario ${usuario.id} a subalmacén ${subalmacen_id}`);
    
    // Si es admin, siempre tiene acceso
    if (usuario.rol === 2) { // ADMINISTRACIÓN
      console.log('👑 Administrador tiene acceso total');
      return res.json({ 
        success: true,
        data: { 
          tiene_acceso: true, 
          rol: 'administrador' 
        }
      });
    }
    
    // Si es coordinador, verificar acceso específico
    if (usuario.rol === 3) { // COORDINADOR
      const [acceso] = await pool.query(`
        SELECT ua.*, s.nombre as subalmacen_nombre, a.nombre as almacen_nombre
        FROM usuario_almacenes ua
        INNER JOIN subalmacenes s ON ua.subalmacen_id = s.id
        INNER JOIN almacenes a ON s.almacen_id = a.id
        WHERE ua.usuario_id = ? AND ua.subalmacen_id = ?
      `, [usuario.id, subalmacen_id]);
      
      if (acceso.length > 0) {
        console.log(`✅ Coordinador tiene acceso a subalmacén ${subalmacen_id}`);
        return res.json({ 
          success: true,
          data: {
            tiene_acceso: true, 
            rol: 'coordinador',
            acceso: acceso[0]
          }
        });
      } else {
        console.log(`❌ Coordinador NO tiene acceso a subalmacén ${subalmacen_id}`);
        return res.json({ 
          success: true,
          data: {
            tiene_acceso: false, 
            rol: 'coordinador',
            motivo: 'No tienes acceso a este subalmacén'
          }
        });
      }
    }
    
    // Otros roles no tienen acceso
    console.log(`❌ Rol ${usuario.rol} no tiene acceso a subalmacenes`);
    return res.status(403).json({ 
      success: false,
      error: 'Solo administradores y coordinadores pueden acceder a esta funcionalidad' 
    });
    
  } catch (error) {
    console.error('❌ Error en verificarAccesoSubalmacen:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};
