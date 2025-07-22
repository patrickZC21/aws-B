import express from 'express';
import {
  crearUsuarioAlmacen,
  listarUsuarioAlmacenes,
  obtenerUsuarioAlmacenPorId, // si lo agregas
  actualizarUsuarioAlmacen,
  eliminarUsuarioAlmacen,
  eliminarAccesosPorUsuario, // Asegúrate de importar la función
} from '../controllers/usuario_almacen.controller.js';

// 👇 Define el router antes de usarlo
const router = express.Router();

router.post('/', crearUsuarioAlmacen);
router.get('/', listarUsuarioAlmacenes);
router.get('/:id', obtenerUsuarioAlmacenPorId);  // solo si ya tienes el controlador
router.put('/:id', actualizarUsuarioAlmacen);
router.delete('/:id', eliminarUsuarioAlmacen);
// Eliminar todos los accesos de un usuario (por usuario_id)
router.delete('/usuario/:usuario_id', eliminarAccesosPorUsuario);

export default router;
