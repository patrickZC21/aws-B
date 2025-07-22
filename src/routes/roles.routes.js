import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import {
  crearRol,
  listarRoles,
  obtenerRol,
  actualizarRol,
  eliminarRol,
} from '../controllers/roles.controller.js';

const router = express.Router();

router.post('/', verificarToken, crearRol);
router.get('/', verificarToken, listarRoles);
router.get('/:id', verificarToken, obtenerRol);
router.put('/:id', verificarToken, actualizarRol);
router.delete('/:id', verificarToken, eliminarRol);

export default router;
