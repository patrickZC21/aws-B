import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import {
  crearSubalmacen,
  listarSubalmacenes,
  obtenerSubalmacen,
  actualizarSubalmacen,
  eliminarSubalmacen,
  infoSubalmacen,
} from '../controllers/subalmacenes.controller.js';
import { listarSubalmacenesAsignadosController } from '../controllers/almacenes.controller.js';

const router = express.Router();

router.post('/', verificarToken, crearSubalmacen);
router.get('/', verificarToken, listarSubalmacenes);
router.get('/:id', verificarToken, obtenerSubalmacen);
router.get('/:id/info', verificarToken, infoSubalmacen);
router.put('/:id', verificarToken, actualizarSubalmacen);
router.delete('/:id', verificarToken, eliminarSubalmacen);
// Listar subalmacenes asignados al usuario coordinador en un almacén específico
router.get('/asignados/:almacenId', verificarToken, listarSubalmacenesAsignadosController);

export default router;
