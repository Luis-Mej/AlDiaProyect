import express from 'express';
import {
  consultaDirecta,
  consultarMisServicios
} from '../controllers/consultasController.js';
import { verificarToken } from '../middlewares/authorizeMiddleware.js';

const router = express.Router();

// consulta libre
router.get('/', consultaDirecta);

// mis servicios requiere token
router.get('/mis-servicios', verificarToken, consultarMisServicios);

export default router;
