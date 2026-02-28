import express from 'express';
import {
  generarConsejo,
  obtenerConsejosUsuario,
  obtenerAnalisisCompleto
} from '../controllers/consejoAhorroController.js';
import { verificarToken, verificarPremium } from '../middlewares/authorizeMiddleware.js';

const router = express.Router();

router.use(verificarToken);

// Generar y guardar consejo
router.post('/generar', generarConsejo);

// Obtener todos los consejos del usuario
router.get('/', obtenerConsejosUsuario);

// Análisis avanzado (premium)
router.get('/analisis/completo', verificarPremium, obtenerAnalisisCompleto);

export default router;