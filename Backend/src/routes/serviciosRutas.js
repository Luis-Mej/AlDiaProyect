import express from 'express';
import {
    obtenerServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio
} from '../controllers/serviciosControllers.js';

import { verificarToken } from '../middlewares/authorizeMiddleware.js';
import { validarCrearServicio, validationErrorHandler } from '../utils/validaciones.js';

const router = express.Router();

// TODAS ESTAS RUTAS NECESITAN TOKEN
router.use(verificarToken);

router.post("/crear", validarCrearServicio, validationErrorHandler, crearServicio);
router.get("/", obtenerServicios);
router.put("/actualizar/:id", validarCrearServicio, validationErrorHandler, actualizarServicio);
router.delete("/eliminar/:id", eliminarServicio);

export default router;
