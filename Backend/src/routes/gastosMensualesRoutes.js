import express from "express";
import {
  crearGasto,
  marcarPagado,
  listarMisGastos,
  agregarServicioManual
} from "../controllers/gastosMensualesController.js";

import authorize from "../middlewares/authorizeMiddleware.js";

const router = express.Router();

// 🔒 Todas requieren usuario autenticado
router.use(authorize);

// Crear gasto mensual
router.post("/", crearGasto);

// 🔥 LISTAR MIS GASTOS (SIN ID)
router.get("/mis-gastos", listarMisGastos);

// Marcar como pagado
router.patch("/:id/pagar", marcarPagado);

// 🔥 AGREGAR SERVICIO MANUAL + GASTO
router.post("/manual", agregarServicioManual);

export default router;