import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js'; // <-- Agrega esto

import { obtenerResumenDashboard } from '../controllers/dashboard/resumen.controller.js';
import { obtenerTrabajadoresSemana } from '../controllers/dashboard/trabajadoresSemana.controller.js';
import { obtenerHorasExtras } from '../controllers/dashboard/horasExtras.controller.js';
import { obtenerHorasFaltantes } from '../controllers/dashboard/horasFaltantes.controller.js';

const router = Router();

router.get('/resumen', verificarToken, obtenerResumenDashboard);
router.get('/trabajadores-semana', verificarToken, obtenerTrabajadoresSemana);
router.get('/horas-extras', verificarToken, obtenerHorasExtras);
router.get('/horas-faltantes', verificarToken, obtenerHorasFaltantes);

export default router;
