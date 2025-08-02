import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import {
  crearTrabajador,
  listarTrabajadores,
  obtenerTrabajador,
  actualizarTrabajador,
  eliminarTrabajador,
  actualizarEstadoTrabajador,
  listarTrabajadoresPorFecha,
} from '../controllers/trabajadores.controller.js';

const router = express.Router();

// Crear trabajador
router.post('/', verificarToken, crearTrabajador);

// Listar todos los trabajadores
router.get('/', verificarToken, listarTrabajadores);

// Obtener un trabajador por ID
router.get('/:id', verificarToken, obtenerTrabajador);

// Actualizar trabajador
router.put('/:id', verificarToken, actualizarTrabajador);

// Eliminar trabajador
router.delete('/:id', verificarToken, eliminarTrabajador);

// Nueva ruta para activar/desactivar trabajador
router.patch('/:id/activar', verificarToken, actualizarEstadoTrabajador);

// Ruta para obtener trabajadores por subalmacen y fecha
router.get('/por-fecha', verificarToken, listarTrabajadoresPorFecha);

export default router;
