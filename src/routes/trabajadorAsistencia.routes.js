import { Router } from 'express';
import { verAsistenciasDeTrabajador } from '../controllers/trabajadorAsistencia.controller.js';

const router = Router();

// GET /api/trabajadorAsistencia/:id
router.get('/:id', verAsistenciasDeTrabajador);

export default router;
