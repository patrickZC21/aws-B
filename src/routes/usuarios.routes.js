import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuarios.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     description: Crea un nuevo usuario en el sistema con validaciones de seguridad
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Usuario'
 *               - type: object
 *                 properties:
 *                   almacenes:
 *                     type: array
 *                     description: Array de asignaciones de subalmacenes
 *                     items:
 *                       type: object
 *                       properties:
 *                         subalmacen_id:
 *                           type: integer
 *                         limite_ingresos:
 *                           type: integer
 *                           nullable: true
 *           example:
 *             nombre: "Juan Pérez"
 *             correo: "juan@brayamsac.com"
 *             password: "Password123!"
 *             rol_id: 3
 *             almacenes: [{"subalmacen_id": 1, "limite_ingresos": 100}]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 almacenes:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', verificarToken, crearUsuario);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     description: Obtiene la lista completa de usuarios con información de roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Usuario'
 *                   - type: object
 *                     properties:
 *                       nombre_rol:
 *                         type: string
 *                         description: Nombre del rol asignado
 *       401:
 *         description: No autorizado
 */
router.get('/', verificarToken, listarUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', verificarToken, obtenerUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
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
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', verificarToken, actualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     description: Elimina un usuario y todas sus relaciones (CASCADE)
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
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', verificarToken, eliminarUsuario);

export default router;
