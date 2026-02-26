import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { conectarDB } from "./configuration/basedatos.js";
import { handleErrors } from "./utils/handleErrors.js";
import logger from "./utils/logger.js";

import usuariosRutas from "./routes/usuariosRutas.js";
import serviciosUsuarioRutas from "./routes/serviciosUsuarioRutas.js";
import consultasRutas from "./routes/consultasRutas.js";
import recordatoriosRutas from "./routes/recordatoriosRutas.js";
import consejosAhorroRutas from "./routes/consejosAhorroRutas.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Conexión BD
conectarDB();

// Rutas
app.use("/api/usuarios", usuariosRutas);
app.use("/api/mis-servicios", serviciosUsuarioRutas);
app.use("/api/consultas", consultasRutas);
app.use("/api/recordatorios", recordatoriosRutas);
app.use("/api/consejos-ahorro", consejosAhorroRutas);
app.use("/api/asistente", (await import("./routes/asistenteRutas.js")).default);

// MIDDLEWARE FINAL: Manejador global de errores
app.use(handleErrors);

// 👉 Exportación correcta
export default app;