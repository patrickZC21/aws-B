import { Router } from 'express';
import {
  exportarAsistenciasPorTrabajador,
  exportarFechasSeleccionadas
} from '../controllers/export.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Exportación
 *   description: Endpoints para generar reportes en Excel
 */

/**
 * @swagger
 * /api/exportar/asistencias/trabajador/{id}:
 *   get:
 *     summary: Exportar asistencias de un trabajador
 *     tags: [Exportación]
 *     description: Genera un archivo Excel con las asistencias de un trabajador específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Archivo Excel generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Trabajador no encontrado
 *       500:
 *         description: Error al generar el archivo
 */
router.get('/asistencias/trabajador/:id', exportarAsistenciasPorTrabajador);

/**
 * @swagger
 * /api/exportar/fechas-excel:
 *   get:
 *     summary: Exportar asistencias por fechas seleccionadas
 *     tags: [Exportación]
 *     description: Genera un archivo Excel con asistencias de fechas específicas
 *     parameters:
 *       - in: query
 *         name: fechasIds
 *         required: true
 *         schema:
 *           type: string
 *         description: IDs de fechas separados por comas (ej. "1,2,3")
 *         example: "1,2,3"
 *       - in: query
 *         name: subalmacenId
 *         schema:
 *           type: integer
 *         description: ID del subalmacén (opcional)
 *     responses:
 *       200:
 *         description: Archivo Excel generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *             description: 'attachment; filename="asistencias_fechas_YYYY-MM-DD.xlsx"'
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error al generar el archivo
 */
router.get('/fechas-excel', exportarFechasSeleccionadas);

// Si luego creas exportarAsistenciasCompleto, puedes volver a agregar la ruta

export default router;


