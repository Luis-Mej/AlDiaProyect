import express from "express";
import {
  crearServicio,
  listarServicios,
  eliminarServicio
} from "../controllers/servicioRecurrenteController.js";

import authMiddleware from "../middlewares/authorizeMiddleware.js";

// nota: esta ruta se usa tanto en /api/servicios como en /api/mis-servicios

const router = express.Router();

// Crear servicio (requiere login)
router.post("/", authMiddleware, crearServicio);

// Listar servicios del usuario autenticado
router.get("/", authMiddleware, listarServicios);

// Eliminar servicio
router.delete("/:id", authMiddleware, eliminarServicio);

export default router;