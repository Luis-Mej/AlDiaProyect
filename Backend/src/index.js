import dotenv from "dotenv";
dotenv.config(); // ← cargar variables lo primero

import app from "./app.js";
import { conectarDB } from "./configuration/basedatos.js";
import {
  iniciarCronRecordatorios,
  iniciarCronActualizacionEstados
} from "./utils/cronReminders.js";

const PORT = process.env.PORT || 4000;

const iniciarServidor = async () => {
  try {
    // 🔌 Conectar a MongoDB
    await conectarDB();
    console.log("✅ Base de datos conectada correctamente");

    // 🚀 Levantar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);

      // ⏰ Iniciar cron jobs
      iniciarCronRecordatorios();
      iniciarCronActualizacionEstados();
    });

  } catch (error) {
    console.error("❌ Error al iniciar la aplicación:", error.message);
    process.exit(1);
  }
};

iniciarServidor();