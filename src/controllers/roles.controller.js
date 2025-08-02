import * as RolService from '../services/rol.service.js';

// Crear rol
export const crearRol = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }
  try {
    const rol = await RolService.crearRol(nombre);
    res.status(201).json(rol);
  } catch (error) {
    console.error('❌ Error al crear rol:', error.message);
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

// Listar roles
export const listarRoles = async (req, res) => {
  try {
    const rows = await RolService.listarRoles();
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener roles:', error.message);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

// Obtener rol por ID
export const obtenerRol = async (req, res) => {
  try {
    const rol = await RolService.obtenerRol(req.params.id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(rol);
  } catch (error) {
    console.error('❌ Error al buscar rol:', error.message);
    res.status(500).json({ error: 'Error al buscar rol' });
  }
};

// Actualizar rol
export const actualizarRol = async (req, res) => {
  const { nombre } = req.body;
  try {
    const affectedRows = await RolService.actualizarRol(req.params.id, nombre);
    if (affectedRows === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json({ mensaje: 'Rol actualizado' });
  } catch (error) {
    console.error('❌ Error al actualizar rol:', error.message);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

// Eliminar rol
export const eliminarRol = async (req, res) => {
  try {
    const affectedRows = await RolService.eliminarRol(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json({ mensaje: 'Rol eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar rol:', error.message);
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};
