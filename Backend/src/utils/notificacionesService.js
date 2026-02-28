import recordatorioModel from "../models/recordatorioModel.js";
import usuarioModel from "../models/usuarioModel.js";
import { enviarCorreo } from "../utils/emailService.js";
import logger from "../utils/logger.js";

export const enviarNotificacionesPendientes = async () => {
  logger.info("Iniciando envío de notificaciones pendientes..."); // <-- AÑADE ESTE LOG
  try {
    const hoy = new Date();

    const recordatorios = await recordatorioModel.find({
      fechaPago: { $lte: hoy }, // Usar fechaPago en lugar de fecha
      notificacionEnviada: false // Usar notificacionEnviada en lugar de notificado
    }).populate("usuarioId");

    let exitosos = 0;
    let fallidos = 0;

    for (const recordatorio of recordatorios) {
      const usuario = recordatorio.usuarioId;

      if (!usuario) continue;

      try {
        await enviarCorreo(
          usuario.email, // Usar usuario.email en lugar de usuario.correo
          "Recordatorio de pago - AlDia",
          `
            <h2>Hola ${usuario.nombre}</h2>
            <p>Tienes un pago pendiente:</p>
            <strong>${recordatorio.servicio}</strong>  // Usar recordatorio.servicio en lugar de recordatorio.titulo
            <p>Monto: $${recordatorio.monto}</p> // Usar recordatorio.monto
            <p>Fecha límite: ${recordatorio.fechaPago.toLocaleDateString()}</p> // Usar fechaPago
          `
        );

        recordatorio.notificacionEnviada = true; // Usar notificacionEnviada
        await recordatorio.save();
        exitosos++;
      } catch (err) {
        logger.error("Fallo al enviar notificación para recordatorio", recordatorio._id, err.message);
        fallidos++;
      }
    }

    logger.info("Notificaciones procesadas correctamente");
    return { exitosos, fallidos };
  } catch (error) {
    logger.error("Error enviando notificaciones:", error.message);
    throw error;
  } finally {
    logger.info("Finalizando envío de notificaciones pendientes."); // <-- AÑADE ESTE LOG
  }
};

// verifica y marca recordatorios vencidos; devuelve resultado de updateMany
export const verificarRecordatoriosVencidos = async () => {
  const now = new Date();
  const result = await recordatorioModel.updateMany(
    { fechaPago: { $lt: now }, notificacionEnviada: false }, // Usar fechaPago y notificacionEnviada
    { notificacionEnviada: true } // Usar notificacionEnviada
  );
  return result;
};

// estadísticas simples de notificaciones (puede ampliarse)
export const obtenerEstadisticasNotificaciones = async () => {
  const total = await recordatorioModel.countDocuments();
  const pendientes = await recordatorioModel.countDocuments({ notificacionEnviada: false }); // Usar notificacionEnviada
  return { total, pendientes };
};

// alias utilizado por cronReminders
export const verificarYEnviarRecordatorios = enviarNotificacionesPendientes;