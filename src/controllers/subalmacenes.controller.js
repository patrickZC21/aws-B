import * as SubalmacenService from '../services/subalmacen.service.js';

// Crear subalmacén
export const crearSubalmacen = async (req, res) => {
  const { nombre, almacen_id, refrigerio, jornada } = req.body;
  if (!nombre || !almacen_id) {
    return res.status(400).json({ error: 'Nombre y almacen_id son requeridos' });
  }
  try {
    const result = await SubalmacenService.crearSubalmacen(nombre, almacen_id, refrigerio, jornada);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error al crear subalmacén:', error.message);
    res.status(500).json({ error: 'Error al crear subalmacén' });
  }
};

// Listar subalmacenes
export const listarSubalmacenes = async (req, res) => {
  try {
    if (req.query.almacen_id) {
      const rows = await SubalmacenService.listarSubalmacenesPorAlmacen(req.query.almacen_id);
      return res.json(rows);
    }
    const rows = await SubalmacenService.listarSubalmacenes();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener subalmacenes:', error.message);
    res.status(500).json({ error: 'Error al obtener subalmacenes' });
  }
};

// Obtener subalmacén por ID
export const obtenerSubalmacen = async (req, res) => {
  try {
    const subalmacen = await SubalmacenService.obtenerSubalmacen(req.params.id);
    if (!subalmacen)
      return res.status(404).json({ error: 'Subalmacén no encontrado' });
    res.json(subalmacen);
  } catch (error) {
    console.error('❌ Error al buscar subalmacén:', error.message);
    res.status(500).json({ error: 'Error al buscar subalmacén' });
  }
};

// Obtener info de subalmacén y almacén asociado
export const infoSubalmacen = async (req, res) => {
  try {
    const info = await SubalmacenService.obtenerInfoSubalmacen(req.params.id);
    if (!info) return res.status(404).json({ error: 'Subalmacén no encontrado' });
    res.json(info);
  } catch (error) {
    console.error('❌ Error al obtener info de subalmacén:', error.message);
    res.status(500).json({ error: 'Error al obtener info de subalmacén' });
  }
};

// Actualizar subalmacén
export const actualizarSubalmacen = async (req, res) => {
  const { nombre, almacen_id, refrigerio, jornada } = req.body;
  try {
    const affectedRows = await SubalmacenService.actualizarSubalmacen(
      req.params.id, nombre, almacen_id, refrigerio, jornada
    );
    if (affectedRows === 0)
      return res.status(404).json({ error: 'Subalmacén no encontrado' });
    res.json({ mensaje: 'Subalmacén actualizado' });
  } catch (error) {
    console.error('❌ Error al actualizar subalmacén:', error.message);
    res.status(500).json({ error: 'Error al actualizar subalmacén' });
  }
};

// Eliminar subalmacén
export const eliminarSubalmacen = async (req, res) => {
  try {
    const affectedRows = await SubalmacenService.eliminarSubalmacen(req.params.id);
    if (affectedRows === 0)
      return res.status(404).json({ error: 'Subalmacén no encontrado' });
    res.json({ mensaje: 'Subalmacén eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar subalmacén:', error.message);
    res.status(500).json({ error: 'Error al eliminar subalmacén' });
  }
};
