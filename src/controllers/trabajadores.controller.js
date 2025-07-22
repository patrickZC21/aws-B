import * as TrabajadorService from '../services/trabajador.service.js';
import * as TrabajadorExtraService from '../services/trabajador.extra.js';

// Crear trabajador
export const crearTrabajador = async (req, res) => {
  const { nombre, dni, subalmacen_id, coordinador_id, horas_objetivo } = req.body;
  if (!nombre || !dni || !subalmacen_id) {
    return res.status(400).json({ error: 'Nombre, DNI y subalmacen_id son requeridos' });
  }
  try {
    const trabajador = await TrabajadorService.crearTrabajador(
      nombre, dni, subalmacen_id, coordinador_id, horas_objetivo
    );
    res.status(201).json(trabajador);
  } catch (error) {
    console.error('❌ Error al crear trabajador:', error.message);
    res.status(500).json({ error: 'Error al crear trabajador' });
  }
};

// Listar todos los trabajadores
export const listarTrabajadores = async (req, res) => {
  try {
    const rows = await TrabajadorService.listarTrabajadores();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener trabajadores:', error.message);
    res.status(500).json({ error: 'Error al obtener trabajadores' });
  }
};

// Obtener trabajador por ID
export const obtenerTrabajador = async (req, res) => {
  try {
    const trabajador = await TrabajadorService.obtenerTrabajador(req.params.id);
    if (!trabajador)
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.json(trabajador);
  } catch (error) {
    console.error('❌ Error al buscar trabajador:', error.message);
    res.status(500).json({ error: 'Error al buscar trabajador' });
  }
};

// Actualizar trabajador
export const actualizarTrabajador = async (req, res) => {
  const { nombre, dni, subalmacen_id, coordinador_id, horas_objetivo } = req.body;
  try {
    const affectedRows = await TrabajadorService.actualizarTrabajador(
      req.params.id, nombre, dni, subalmacen_id, coordinador_id, horas_objetivo
    );
    if (affectedRows === 0)
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.json({ mensaje: 'Trabajador actualizado' });
  } catch (error) {
    console.error('❌ Error al actualizar trabajador:', error.message);
    res.status(500).json({ error: 'Error al actualizar trabajador' });
  }
};

// Eliminar trabajador
export const eliminarTrabajador = async (req, res) => {
  try {
    const affectedRows = await TrabajadorService.eliminarTrabajador(req.params.id);
    if (affectedRows === 0)
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    res.json({ mensaje: 'Trabajador eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar trabajador:', error.message);
    res.status(500).json({ error: 'Error al eliminar trabajador' });
  }
};

// Actualizar estado de trabajador
export const actualizarEstadoTrabajador = async (req, res) => {
  const { activo } = req.body;
  try {
    const affectedRows = await TrabajadorService.actualizarEstadoTrabajador(req.params.id, activo);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }
    res.json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    console.error('Error al actualizar estado del trabajador:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

// Obtener trabajadores (fijos y rotados) por subalmacen y fecha
export const listarTrabajadoresPorFecha = async (req, res) => {
  const { subalmacen_id, fecha } = req.query;
  if (!subalmacen_id || !fecha) {
    return res.status(400).json({ error: 'subalmacen_id y fecha son requeridos' });
  }
  try {
    const trabajadores = await TrabajadorExtraService.listarTrabajadoresPorSubalmacenYFecha(subalmacen_id, fecha);
    res.json(trabajadores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener trabajadores', detalle: error.message });
  }
};
