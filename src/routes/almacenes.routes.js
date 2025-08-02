import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import {
  listarAlmacenes,
  crearAlmacen,
  obtenerAlmacen,
  actualizarAlmacen,
  eliminarAlmacen,
  listarAlmacenesAsignadosController,
} from '../controllers/almacenes.controller.js';

const router = express.Router();

// Crear almacén
router.post('/', verificarToken, crearAlmacen);

// Listar todos los almacenes
router.get('/', verificarToken, listarAlmacenes);

// Obtener almacén por ID
router.get('/:id', verificarToken, obtenerAlmacen);

// Actualizar almacén
router.put('/:id', verificarToken, actualizarAlmacen);

// Eliminar almacén
router.delete('/:id', verificarToken, eliminarAlmacen);

// Listar almacenes asignados al usuario coordinador
router.get('/asignados', verificarToken, listarAlmacenesAsignadosController);

export default router;
