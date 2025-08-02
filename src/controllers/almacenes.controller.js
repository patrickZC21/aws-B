// Importa todas las funciones del servicio de almacenes
import * as AlmacenesService from '../services/almacen.service.js';
import { listarAlmacenesAsignados, listarSubalmacenesAsignados } from '../services/almacen.service.js';

/**
 * Crear un nuevo almacén
 * @route POST /api/almacenes
 */
export const crearAlmacen = async (req, res) => {
  // Extrae los datos del cuerpo de la petición
  const { nombre, descripcion } = req.body;
  // Valida que el nombre sea obligatorio
  if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });

  try {
    // Llama al service para crear el almacén en la BD
    const data = await AlmacenesService.crearAlmacen(nombre, descripcion);
    // Devuelve el almacén creado
    res.status(201).json(data);
  } catch (error) {
    // Manejo de errores y log en consola
    console.error('❌ Error al crear almacén:', error.message);
    res.status(500).json({ error: 'Error al crear almacén' });
  }
};

/**
 * Listar todos los almacenes (filtrado por permisos de coordinador)
 * @route GET /api/almacenes
 */
export const listarAlmacenes = async (req, res) => {
  try {
    // Permitir que cualquier usuario autenticado vea todos los almacenes
    const rows = await AlmacenesService.listarAlmacenes();
    return res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener almacenes:', error.message);
    res.status(500).json({ error: 'Error al obtener almacenes' });
  }
};

/**
 * Obtener un almacén por su ID
 * @route GET /api/almacenes/:id
 */
export const obtenerAlmacen = async (req, res) => {
  try {
    // Busca el almacén por ID usando el service
    const almacen = await AlmacenesService.obtenerAlmacen(req.params.id);
    // Si no existe, devuelve error 404
    if (!almacen) return res.status(404).json({ error: 'Almacén no encontrado' });
    // Devuelve el almacén encontrado
    res.json(almacen);
  } catch (error) {
    console.error('❌ Error al buscar almacén:', error.message);
    res.status(500).json({ error: 'Error al buscar almacén' });
  }
};

/**
 * Actualizar un almacén existente
 * @route PUT /api/almacenes/:id
 */
export const actualizarAlmacen = async (req, res) => {
  // Extrae los datos del cuerpo de la petición
  const { nombre, descripcion } = req.body;
  try {
    // Llama al service para actualizar el almacén
    const affectedRows = await AlmacenesService.actualizarAlmacen(req.params.id, nombre, descripcion);
    // Si no se actualizó ningún registro, almacén no encontrado
    if (affectedRows === 0) return res.status(404).json({ error: 'Almacén no encontrado' });
    // Devuelve mensaje de éxito
    res.json({ mensaje: 'Almacén actualizado' });
  } catch (error) {
    console.error('❌ Error al actualizar almacén:', error.message);
    res.status(500).json({ error: 'Error al actualizar almacén' });
  }
};

/**
 * Eliminar un almacén por ID
 * @route DELETE /api/almacenes/:id
 */
export const eliminarAlmacen = async (req, res) => {
  try {
    // Llama al service para eliminar el almacén por ID
    const affectedRows = await AlmacenesService.eliminarAlmacen(req.params.id);
    // Si no se eliminó ningún registro, almacén no encontrado
    if (affectedRows === 0) return res.status(404).json({ error: 'Almacén no encontrado' });
    // Devuelve mensaje de éxito
    res.json({ mensaje: 'Almacén eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar almacén:', error.message);
    
    // Si es un error de validación (restricciones), devolver código 400
    if (error.message.includes('No se puede eliminar')) {
      return res.status(400).json({ error: error.message });
    }
    
    // Para otros errores, devolver código 500
    res.status(500).json({ error: 'Error interno del servidor al eliminar almacén' });
  }
};

/**
 * Listar almacenes donde el usuario tiene subalmacenes asignados
 * @route GET /api/almacenes/asignados
 */
export const listarAlmacenesAsignadosController = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const rows = await listarAlmacenesAsignados(userId);
    return res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener almacenes asignados:', error.message);
    res.status(500).json({ error: 'Error al obtener almacenes asignados' });
  }
};

/**
 * Listar subalmacenes asignados a un usuario en un almacén específico
 * @route GET /api/subalmacenes/asignados/:almacenId
 */
export const listarSubalmacenesAsignadosController = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const almacenId = req.params.almacenId;
    console.log('userId:', userId, 'almacenId:', almacenId);
    if (!userId || !almacenId) {
      return res.status(400).json({ error: 'Faltan parámetros: userId o almacenId' });
    }
    const rows = await listarSubalmacenesAsignados(userId, almacenId);
    return res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener subalmacenes asignados:', error);
    res.status(500).json({ error: 'Error interno al obtener subalmacenes asignados', detalle: error.message });
  }
};
