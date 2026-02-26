import express from "express";
import {
  obtenerRecordatorios,
  obtenerRecordatorioPorId,
  crearRecordatorio,
  actualizarRecordatorio,
  eliminarRecordatorio,
  completarRecordatorio
} from "../controllers/recordatoriosController.js";
import { verificarToken } from "../middlewares/authorizeMiddleware.js";
import { recordatoriosLimiter } from "../middlewares/rateLimitMiddleware.js";

const router = express.Router();

// Todas las rutas de recordatorios requieren autenticación
router.use(verificarToken, recordatoriosLimiter);

// GET /recordatorios - obtener todos los recordatorios del usuario
router.get("/", obtenerRecordatorios);

// GET /recordatorios/:id - obtener un recordatorio específico
router.get("/:id", obtenerRecordatorioPorId);

// POST /recordatorios - crear nuevo recordatorio
router.post("/", crearRecordatorio);

// PUT /recordatorios/:id - actualizar recordatorio
router.put("/:id", actualizarRecordatorio);

// DELETE /recordatorios/:id - eliminar recordatorio
router.delete("/:id", eliminarRecordatorio);

// PATCH /recordatorios/:id/completar - marcar como completado
router.patch("/:id/completar", completarRecordatorio);

export default router;
