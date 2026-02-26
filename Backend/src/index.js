import app from "./app.js";
import { iniciarCronRecordatorios, iniciarCronActualizacionEstados } from "./utils/cronReminders.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});

// Inicializar cron jobs para recordatorios
iniciarCronRecordatorios();
iniciarCronActualizacionEstados();

