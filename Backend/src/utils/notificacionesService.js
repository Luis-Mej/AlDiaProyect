// src/utils/notificacionesService.js
import nodemailer from 'nodemailer';
import recordatorioModel from '../models/recordatorioModel.js';
import usuarioModel from '../models/usuarioModel.js';
import logger from './logger.js';

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Enviar notificación de recordatorio por email
 */
export async function enviarNotificacionRecordatorio(recordatorio, usuario) {
  try {
    if (!usuario.email) {
      logger.warn(`Usuario ${usuario._id} sin email para notificación`);
      return false;
    }

    const diasRestantes = Math.ceil(
      (new Date(recordatorio.fechaPago) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const templateHTML = generarTemplateEmail(recordatorio, usuario, diasRestantes);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: usuario.email,
      subject: `📢 Recordatorio de pago: ${recordatorio.servicio.toUpperCase()} - En ${diasRestantes} día(s)`,
      html: templateHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Notificación enviada a ${usuario.email} - MessageID: ${info.messageId}`);

    // Marcar como notificación enviada
    await recordatorioModel.findByIdAndUpdate(
      recordatorio._id,
      { notificacionEnviada: true },
      { new: true }
    );

    return true;
  } catch (error) {
    logger.error(`Error enviando notificación para recordatorio ${recordatorio._id}:`, error);
    return false;
  }
}

/**
 * Generar template HTML para el email de recordatorio
 */
function generarTemplateEmail(recordatorio, usuario, diasRestantes) {
  const fechaPago = new Date(recordatorio.fechaPago).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const montoHTML = recordatorio.monto
    ? `<p><strong>Monto estimado:</strong> $${recordatorio.monto.toFixed(2)}</p>`
    : '';

  const notasHTML = recordatorio.notas
    ? `<p><strong>Notas:</strong> ${recordatorio.notas}</p>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
          .content { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #1f2937; font-size: 24px; }
          .service-badge { display: inline-block; background: #3b82f6; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .info-box p { margin: 8px 0; color: #374151; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
          .btn { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>¡Recordatorio de Pago!</h1>
              <span class="service-badge">${recordatorio.servicio.toUpperCase()}</span>
            </div>

            <p>Hola <strong>${usuario.nombre}</strong>,</p>
            
            <p>Te recordamos que tu pago vence en <strong>${diasRestantes} día(s)</strong>:</p>

            <div class="info-box">
              <p><strong>Servicio:</strong> ${recordatorio.servicio.toUpperCase()}</p>
              <p><strong>Cuenta:</strong> ${recordatorio.cuenta}</p>
              <p><strong>Fecha de pago:</strong> ${fechaPago}</p>
              ${montoHTML}
              ${notasHTML}
            </div>

            ${diasRestantes <= 0 ? `
              <div class="warning">
                <strong>⚠️ Este pago está vencido</strong>
                <p>Te recomendamos realizarlo lo antes posible para evitar sanciones.</p>
              </div>
            ` : ''}

            <p style="margin-top: 20px;">Accede a tu aplicación para ver todos tus recordatorios y administrar tus pagos.</p>

            <footer class="footer">
              <p>Este es un recordatorio automático de AlDía - Tu Asistente de Finanzas</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Verificar y enviar recordatorios pendientes
 * Esta función se ejecuta periódicamente mediante un cron job
 */
export async function verificarYEnviarRecordatorios() {
  try {
    logger.info('Iniciando verificación de recordatorios pendientes...');

    const ahora = new Date();

    // Buscar recordatorios activos que no han enviado notificación
    const recordatoriosPendientes = await recordatorioModel
      .find({
        estado: 'activo',
        notificacionEnviada: false,
        fechaRecordatorio: { $lte: ahora }
      })
      .populate('usuarioId');

    logger.info(`Se encontraron ${recordatoriosPendientes.length} recordatorios pendientes`);

    let enviados = 0;
    let fallidos = 0;

    for (const recordatorio of recordatoriosPendientes) {
      const usuario = recordatorio.usuarioId;
      if (!usuario) {
        logger.warn(`Recordatorio ${recordatorio._id} sin usuario asociado`);
        fallidos++;
        continue;
      }

      const enviado = await enviarNotificacionRecordatorio(recordatorio, usuario);
      if (enviado) {
        enviados++;
      } else {
        fallidos++;
      }
    }

    logger.info(
      `Verificación completada: ${enviados} enviados, ${fallidos} fallidos`
    );

    return { exitosos: enviados, fallidos };
  } catch (error) {
    logger.error('Error en verificarYEnviarRecordatorios:', error);
    throw error;
  }
}

/**
 * Verificar recordatorios vencidos y actualizar su estado
 */
export async function verificarRecordatoriosVencidos() {
  try {
    const ahora = new Date();

    const vencidos = await recordatorioModel.updateMany(
      {
        estado: 'activo',
        fechaPago: { $lt: ahora }
      },
      {
        estado: 'vencido'
      }
    );

    if (vencidos.modifiedCount > 0) {
      logger.info(`${vencidos.modifiedCount} recordatorios marcados como vencidos`);
    }

    return vencidos;
  } catch (error) {
    logger.error('Error en verificarRecordatoriosVencidos:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de notificaciones
 */
export async function obtenerEstadisticasNotificaciones(usuarioId) {
  try {
    const estadisticas = await recordatorioModel.aggregate([
      { $match: { usuarioId } },
      {
        $group: {
          _id: null,
          totalRecordatorios: { $sum: 1 },
          activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
          completados: { $sum: { $cond: [{ $eq: ['$estado', 'completado'] }, 1, 0] } },
          vencidos: { $sum: { $cond: [{ $eq: ['$estado', 'vencido'] }, 1, 0] } },
          notificacionesEnviadas: { $sum: { $cond: ['$notificacionEnviada', 1, 0] } }
        }
      }
    ]);

    return estadisticas[0] || {
      totalRecordatorios: 0,
      activos: 0,
      completados: 0,
      vencidos: 0,
      notificacionesEnviadas: 0
    };
  } catch (error) {
    logger.error('Error en obtenerEstadisticasNotificaciones:', error);
    throw error;
  }
}
