import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import { handleErrors } from "./utils/handleErrors.js";
import logger from "./utils/logger.js";

import usuariosRutas from "./routes/usuariosRutas.js";
import recordatoriosRutas from "./routes/recordatoriosRutas.js";
import consejosAhorroRutas from "./routes/consejosAhorroRutas.js";
import asistenteRutas from "./routes/asistenteRutas.js";
import servicioRecurrenteRoutes from "./routes/servicioRecurrenteRoutes.js";
import consultasRutas from "./routes/consultasRutas.js";
import gastosMensualesRoutes from "./routes/gastosMensualesRoutes.js";

const app = express();

// ===============================
// 🔧 Middlewares Globales
// ===============================

app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// ===============================
// 🚀 Rutas
// ===============================

app.use("/api/usuarios", usuariosRutas);
app.use("/api/recordatorios", recordatoriosRutas);
app.use("/api/consejos-ahorro", consejosAhorroRutas);
// servicios y mis-servicios usan mismo controlador para compatibilidad
app.use("/api/servicios", servicioRecurrenteRoutes);
app.use("/api/mis-servicios", servicioRecurrenteRoutes);
app.use("/api/consultas", consultasRutas);
app.use("/api/asistente", asistenteRutas);
app.use("/api/gastos", gastosMensualesRoutes);

// ===============================
// ❌ Manejador Global de Errores
// ===============================

app.use(handleErrors);

export default app;