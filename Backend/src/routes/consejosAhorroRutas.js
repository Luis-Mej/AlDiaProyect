// src/routes/consejosAhorroRutas.js

import express from 'express';
import {
  generarConsejosAhorro,
  obtenerConsejosAhorro,
  obtenerAnalisisCompleto,
} from '../controllers/consejosAhorroController.js';
import { verificarToken, verificarPremium } from '../middlewares/authorizeMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// POST /consejos-ahorro/generar - Generar nuevos consejos
router.post('/generar', generarConsejosAhorro);

// GET /consejos-ahorro/:recordatorioId - Obtener consejos de un recordatorio
router.get('/:recordatorioId', obtenerConsejosAhorro);

// GET /consejos-ahorro/analisis/completo - Análisis completo del usuario (PREMIUM)
router.get('/analisis/completo', verificarPremium, obtenerAnalisisCompleto);

export default router;
