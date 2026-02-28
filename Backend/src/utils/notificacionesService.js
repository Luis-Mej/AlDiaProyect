import recordatorioModel from "../models/recordatorioModel.js";
import { enviarCorreo } from "../utils/emailService.js";
import logger from "../utils/logger.js";

/* =====================================================
   ENVÍO DE NOTIFICACIONES
===================================================== */
export const enviarNotificacionesPendientes = async () => {
  logger.info("Iniciando envío de notificaciones pendientes...");

  try {
    const hoy = new Date();

    // Traemos solo los que NO han sido notificados
    const recordatorios = await recordatorioModel
      .find({ notificacionEnviada: false })
      .populate("usuarioId");

    logger.info(`Recordatorios pendientes encontrados: ${recordatorios.length}`);

    let exitosos = 0;
    let fallidos = 0;

    for (const recordatorio of recordatorios) {
      const usuario = recordatorio.usuarioId;
      if (!usuario) continue;

      // 🔥 Calcular fecha real de notificación
      const fechaNotificacion = new Date(recordatorio.fechaPago);
      fechaNotificacion.setDate(
        fechaNotificacion.getDate() - recordatorio.diasAntes
      );

      // Solo enviar si ya llegó el día de notificar
      if (fechaNotificacion > hoy) continue;

      try {
        await enviarCorreo(
          usuario.email,
          "Recordatorio de pago - AlDia",
          `
            <h2>Hola ${usuario.nombre}</h2>
            <p>Tienes un pago pendiente:</p>
            <strong>${recordatorio.servicio}</strong>
            <p>Fecha límite: ${recordatorio.fechaPago.toLocaleDateString()}</p>
          `
        );

        recordatorio.notificacionEnviada = true;
        await recordatorio.save();

        exitosos++;
        logger.info(`Correo enviado correctamente a ${usuario.email}`);
      } catch (err) {
        logger.error(
          `Error enviando correo para recordatorio ${recordatorio._id}:`,
          err.message
        );
        fallidos++;
      }
    }

    logger.info(
      `Finalizado envío: ${exitosos} exitosos, ${fallidos} fallidos`
    );

    return { exitosos, fallidos };
  } catch (error) {
    logger.error("Error general enviando notificaciones:", error.message);
    throw error;
  }
};

/* =====================================================
   MARCAR VENCIDOS
===================================================== */
export const verificarRecordatoriosVencidos = async () => {
  const now = new Date();

  const result = await recordatorioModel.updateMany(
    {
      fechaPago: { $lt: now },
      notificacionEnviada: false
    },
    { notificacionEnviada: true }
  );

  logger.info(`Recordatorios vencidos marcados: ${result.modifiedCount}`);
  return result;
};

/* =====================================================
   ESTADÍSTICAS
===================================================== */
export const obtenerEstadisticasNotificaciones = async () => {
  const total = await recordatorioModel.countDocuments();
  const pendientes = await recordatorioModel.countDocuments({
    notificacionEnviada: false
  });

  return { total, pendientes };
};

// Alias para cron
export const verificarYEnviarRecordatorios =
  enviarNotificacionesPendientes;