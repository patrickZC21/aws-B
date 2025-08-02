import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validarLogin } from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para autenticación y manejo de sesiones
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     description: Autentica un usuario y devuelve un token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             correo: "admin@brayamsac.com"
 *             contraseña: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", validarLogin, AuthController.login);

/**
 * @swagger
 * /api/auth/validar:
 *   get:
 *     summary: Validar token JWT
 *     tags: [Autenticación]
 *     description: Verifica si el token JWT es válido
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valido:
 *                   type: boolean
 *                   example: true
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Token inválido o expirado
 */
router.get("/validar", AuthController.validarToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     description: Cierra la sesión del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: Token inválido
 */
router.post("/logout", verificarToken, AuthController.logout);

/**
 * @swagger
 * /api/auth/forzar-desconexion/{userId}:
 *   post:
 *     summary: Forzar desconexión de usuario
 *     tags: [Autenticación]
 *     description: Permite a un administrador forzar la desconexión de cualquier usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a desconectar
 *     responses:
 *       200:
 *         description: Usuario desconectado exitosamente
 *       401:
 *         description: Sin permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/forzar-desconexion/:userId", verificarToken, AuthController.forzarDesconexion);

/**
 * @swagger
 * /api/auth/force-logout:
 *   post:
 *     summary: Forzar logout por correo
 *     tags: [Autenticación]
 *     description: Permite cerrar una sesión activa usando el correo del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo del usuario
 *             required:
 *               - correo
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 */
router.post("/force-logout", AuthController.forzarLogoutPorCorreo);

export default router;
