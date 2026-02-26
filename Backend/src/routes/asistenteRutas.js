import express from "express";
import { analizarServiciosController } from "../controllers/asistenteController.js";
import { verificarToken, verificarPremium } from "../middlewares/authorizeMiddleware.js";

const router = express.Router();

// Analiza los servicios guardados y los compara con el mes pasado usando la IA (PREMIUM)
router.post("/analizar", verificarToken, verificarPremium, analizarServiciosController);

export default router;