import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  usuarioActualizar,
  usuarioEliminar,
  iniciarSesion,
  verificarCodigo,
  solicitarRecuperacion,
  resetearContrasena,
  reenviarCodigo,
  actualizarSuscripcion
} from "../controllers/usuariosControllers.js";
import { verificarToken } from "../middlewares/authorizeMiddleware.js";
import { loginLimiter, registroLimiter } from "../middlewares/rateLimitMiddleware.js";
import { 
  validarRegistro, 
  validarLogin, 
  validarActualizarUsuario,
  validarSolicitarRecuperacion,
  validarResetContrasena,
  validationErrorHandler 
} from "../utils/validaciones.js";

const router = express.Router();

// Registro y login (NO requieren token, pero con rate limiting y validación)
router.post("/registrar", registroLimiter, validarRegistro, validationErrorHandler, crearUsuario);
router.post("/login", loginLimiter, validarLogin, validationErrorHandler, iniciarSesion);

// Verificación de email (NO requieren token)
router.post("/verificar", loginLimiter, verificarCodigo);
router.post("/reenviar-codigo", loginLimiter, reenviarCodigo);
// Recuperación de contraseña
router.post("/solicitar-recuperacion", loginLimiter, validarSolicitarRecuperacion, validationErrorHandler, solicitarRecuperacion);
router.post("/resetear-contrasena", loginLimiter, validarResetContrasena, validationErrorHandler, resetearContrasena);

// Rutas protegidas con JWT
router.get("/", verificarToken, obtenerUsuarios);
router.get("/:id", verificarToken, obtenerUsuarioPorId);
router.put("/actualizar/:id", verificarToken, validarActualizarUsuario, validationErrorHandler, usuarioActualizar);
router.put("/suscripcion", verificarToken, actualizarSuscripcion);
router.delete("/eliminar/:id", verificarToken, usuarioEliminar);

export default router;
