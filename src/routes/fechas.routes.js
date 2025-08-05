import express from 'express';
import {
  crearFecha,
  crearMultiplesFechas,
  listarFechas,
  obtenerFecha,
  actualizarFecha,
  eliminarFecha,
} from '../controllers/fechas.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verificarToken, crearFecha);
router.post('/batch', verificarToken, crearMultiplesFechas);
router.get('/', listarFechas);
router.get('/:id', obtenerFecha);
router.put('/:id', actualizarFecha);
router.delete('/:id', eliminarFecha);

export default router;
