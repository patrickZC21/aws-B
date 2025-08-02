import express from 'express';
import { crearRotacion, listarRotaciones, eliminarRotacion } from '../controllers/rotacion.controller.js';

const router = express.Router();

router.post('/', crearRotacion);
router.get('/', listarRotaciones);
router.delete('/:id', eliminarRotacion);

export default router;
