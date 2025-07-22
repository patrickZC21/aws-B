import * as UsuarioAlmacenService from '../services/usuario_almacen.service.js';
import pool from '../config/db.js';

// Crear acceso usuario-almacén (ahora soporta múltiples)
export const crearUsuarioAlmacen = async (req, res) => {
  const startTime = Date.now();
  const { usuario_id, subalmacen_id, limite_ingresos, almacenes } = req.body;
  
  // Si viene un array de almacenes, procesar todos
  if (Array.isArray(almacenes) && almacenes.length > 0) {
    if (!usuario_id) {
      return res.status(400).json({ error: 'Usuario es requerido' });
    }
    try {
      const resultados = [];
      for (const a of almacenes) {
        if (!a.subalmacen_id || isNaN(Number(a.subalmacen_id))) {
          return res.status(400).json({ error: 'subalmacen_id es requerido y debe ser numérico en cada almacén', detalle: a });
        }
        
        // Verificación rápida del subalmacén
        const [subalmacenData] = await pool.query('SELECT id, almacen_id FROM subalmacenes WHERE id = ?', [a.subalmacen_id]);
        
        if (subalmacenData.length === 0) {
          return res.status(400).json({ error: 'Subalmacén no encontrado', detalle: { subalmacen_id: a.subalmacen_id } });
        }
        
        const acceso = await UsuarioAlmacenService.crearUsuarioAlmacen(
          usuario_id, a.subalmacen_id, a.limite_ingresos
        );
        resultados.push(acceso);
      }
      
      const endTime = Date.now();
      console.log(`✅ Accesos creados en ${endTime - startTime}ms`);
      return res.status(201).json(resultados);
    } catch (error) {
      console.error('❌ Error al crear accesos:', error.message);
      return res.status(500).json({ error: 'Error al crear accesos', detalle: error.message });
    }
  }
  // Compatibilidad: si viene un solo objeto
  if (!usuario_id || !subalmacen_id) {
    return res.status(400).json({ error: 'Usuario y subalmacén son requeridos' });
  }
  try {
    const acceso = await UsuarioAlmacenService.crearUsuarioAlmacen(
      usuario_id, subalmacen_id, limite_ingresos
    );
    res.status(201).json(acceso);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear acceso', detalle: error.message });
  }
};

// Listar accesos
export const listarUsuarioAlmacenes = async (req, res) => {
  try {
    const rows = await UsuarioAlmacenService.listarUsuarioAlmacenes();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener accesos', detalle: error.message });
  }
};

// Actualizar acceso (puede actualizar todos los campos)
export const actualizarUsuarioAlmacen = async (req, res) => {
  const { usuario_id, subalmacen_id, limite_ingresos, activo } = req.body;
  try {
    const affectedRows = await UsuarioAlmacenService.actualizarUsuarioAlmacen(
      req.params.id, usuario_id, subalmacen_id, limite_ingresos, activo
    );
    if (affectedRows === 0)
      return res.status(404).json({ error: 'No encontrado o sin cambios' });
    res.json({ mensaje: 'Acceso actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar acceso', detalle: error.message });
  }
};

// Eliminar acceso
export const eliminarUsuarioAlmacen = async (req, res) => {
  try {
    const affectedRows = await UsuarioAlmacenService.eliminarUsuarioAlmacen(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Acceso eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar acceso', detalle: error.message });
  }
};
// Obtener acceso usuario-almacén por ID
export const obtenerUsuarioAlmacenPorId = async (req, res) => {
  try {
    const id = req.params.id;
    const rows = await UsuarioAlmacenService.obtenerUsuarioAlmacenPorId(id);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener acceso', detalle: error.message });
  }
};

// Eliminar todos los accesos de un usuario (por usuario_id)
export const eliminarAccesosPorUsuario = async (req, res) => {
  try {
    const usuario_id = req.params.usuario_id;
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id requerido' });
    const [result] = await pool.query('DELETE FROM usuario_almacenes WHERE usuario_id = ?', [usuario_id]);
    res.json({ mensaje: 'Accesos eliminados', eliminados: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar accesos', detalle: error.message });
  }
};
