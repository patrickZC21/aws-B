import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import {
  crearAsistencia,
  listarAsistencias,
  obtenerAsistencia,
  actualizarAsistencia,
  eliminarAsistencia
} from '../controllers/asistencias.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Asistencias
 *   description: Gestión de registros de asistencia de trabajadores
 */

/**
 * @swagger
 * /api/asistencias:
 *   get:
 *     summary: Listar asistencias
 *     tags: [Asistencias]
 *     description: Obtiene registros de asistencia con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: programacion_fecha_id
 *         schema:
 *           type: integer
 *         description: Filtrar por fecha programada
 *       - in: query
 *         name: subalmacen_id
 *         schema:
 *           type: integer
 *         description: Filtrar por subalmacén
 *       - in: query
 *         name: trabajador_id
 *         schema:
 *           type: integer
 *         description: Filtrar por trabajador
 *     responses:
 *       200:
 *         description: Lista de asistencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Asistencia'
 *                   - type: object
 *                     properties:
 *                       trabajador_nombre:
 *                         type: string
 *                       trabajador_dni:
 *                         type: string
 *                       subalmacen_nombre:
 *                         type: string
 *                       almacen_nombre:
 *                         type: string
 *                       registrado_por_nombre:
 *                         type: string
 */
router.get('/', verificarToken, listarAsistencias);

/**
 * @swagger
 * /api/asistencias:
 *   post:
 *     summary: Registrar nueva asistencia
 *     tags: [Asistencias]
 *     description: Crea un nuevo registro de asistencia
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asistencia'
 *           example:
 *             trabajador_id: 1
 *             subalmacen_id: 1
 *             hora_entrada: "08:00"
 *             hora_salida: "17:00"
 *             justificacion: "Sin novedades"
 *             registrado_por: 1
 *             programacion_fecha_id: 1
 *     responses:
 *       201:
 *         description: Asistencia registrada exitosamente
 *       400:
 *         description: Datos inválidos o asistencia duplicada
 *       403:
 *         description: Sin permisos para registrar en este subalmacén
 */
router.post('/', verificarToken, crearAsistencia);

/**
 * @swagger
 * /api/asistencias/{id}:
 *   put:
 *     summary: Actualizar asistencia
 *     tags: [Asistencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hora_entrada:
 *                 type: string
 *                 format: time
 *               hora_salida:
 *                 type: string
 *                 format: time
 *               justificacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asistencia actualizada exitosamente
 *       404:
 *         description: Asistencia no encontrada
 */
router.put('/:id', verificarToken, actualizarAsistencia);

/**
 * @swagger
 * /api/asistencias/{id}:
 *   delete:
 *     summary: Eliminar asistencia
 *     tags: [Asistencias]
 *     description: Elimina un registro de asistencia y rotaciones asociadas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asistencia eliminada exitosamente
 *       404:
 *         description: Asistencia no encontrada
 */
router.delete('/:id', verificarToken, eliminarAsistencia);

export default router;
