import express from "express";
import { verificarToken } from "../middlewares/authorizeMiddleware.js";

import {
    crearServicioUsuario,
    obtenerServiciosUsuario,
    eliminarServicioUsuario
} from "../controllers/serviciosUsuarioController.js";
import { validarCrearServicioUsuario, validationErrorHandler } from "../utils/validaciones.js";

const router = express.Router();

router.post("/", verificarToken, validarCrearServicioUsuario, validationErrorHandler, crearServicioUsuario);
router.get("/", verificarToken, obtenerServiciosUsuario);
router.delete("/:id", verificarToken, eliminarServicioUsuario);

export default router;
