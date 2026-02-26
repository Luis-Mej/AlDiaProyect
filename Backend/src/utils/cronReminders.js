import cron from 'node-cron';
import recordatorioModel from '../models/recordatorioModel.js';
import usuarioModel from '../models/usuarioModel.js';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import {
  verificarYEnviarRecordatorios,
  verificarRecordatoriosVencidos,
  obtenerEstadisticasNotificaciones
} from './notificacionesService.js';

/**
 * Crear transporter de Nodemailer
 */
const crearTransporter = () => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      sendMail: async (mailOptions) => {
        console.log(`📧 [DESARROLLO] Email enviado a ${mailOptions.to}`);
        return { messageId: 'mock-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Inicializar tareas CRON para recordatorios
 * Ejecuta cada 30 minutos para mayor frecuencia en verificación
 */
export const iniciarCronRecordatorios = () => {
  // Ejecutar cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    logger.info('🔔 [CRON] Iniciando verificación de recordatorios pendientes...');
    
    try {
      const resultado = await verificarYEnviarRecordatorios();
      logger.info(`✅ [CRON] Resultado: ${resultado.exitosos} enviados, ${resultado.fallidos} fallidos`);
    } catch (error) {
      logger.error(`❌ [CRON] Error en verificación de recordatorios: ${error.message}`);
    }
  });

  logger.info('✅ Cron job de recordatorios inicializado (se ejecuta cada 30 minutos)');
};

/**
 * Función para marcar recordatorios vencidos como "vencido"
 * (Ejecuta cada 2 horas)
 */
export const iniciarCronActualizacionEstados = () => {
  cron.schedule('0 */2 * * *', async () => {
    logger.info('🔄 [CRON] Actualizando estados de recordatorios vencidos...');
    
    try {
      const resultado = await verificarRecordatoriosVencidos();
      if (resultado.modifiedCount > 0) {
        logger.info(`✅ ${resultado.modifiedCount} recordatorios marcados como vencidos`);
      }
    } catch (error) {
      logger.error(`❌ Error actualizando estados: ${error.message}`);
    }
  });

  logger.info('✅ Cron job de actualización de estados inicializado (cada 2 horas)');
};
