// src/routes/consultasRutas.js
import express from "express";
import { consultarController, consultarMisServiciosController } from "../controllers/consultasController.js";
import { verificarToken } from "../middlewares/authorizeMiddleware.js";
import { consultasLimiter } from "../middlewares/rateLimitMiddleware.js";
import { validarConsulta, validationErrorHandler } from "../utils/validaciones.js";

const router = express.Router();

// Consulta puntual con rate limiting y validación
router.get("/", consultasLimiter, validarConsulta, validationErrorHandler, consultarController);

// Consulta de los servicios guardados (usa token y rate limiting)
router.get("/mis-servicios", verificarToken, consultasLimiter, consultarMisServiciosController);

export default router;
