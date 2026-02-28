import express from "express";
import {
  generarRespuesta,
  obtenerHistorial,
  eliminarConversacion,
  analizarServiciosController
} from "../controllers/asistenteController.js";

import {
  verificarToken,
  verificarPremium
} from "../middlewares/authorizeMiddleware.js";

import { verificarLimiteConsejos } from "../middlewares/verificarLimiteConsejos.js";

const router = express.Router();

// Todas requieren autenticación
router.use(verificarToken);

/* ================================
   🤖 Asistente Conversacional
================================ */

// Generar respuesta IA (freemium con límite diario)
router.post(
  "/preguntar",
  verificarLimiteConsejos,
  generarRespuesta
);

// Historial
router.get("/historial", obtenerHistorial);

// Eliminar conversación
router.delete("/:id", eliminarConversacion);

/* ================================
   🔥 Análisis avanzado (Premium)
================================ */

router.post(
  "/analizar",
  verificarPremium,
  analizarServiciosController
);

export default router;