import nodemailer from "nodemailer";
import logger from "./logger.js";

const crearTransporter = () => {
  if (process.env.NODE_ENV === "development") {
    return {
      sendMail: async (options) => {
        logger.info("Email simulado en desarrollo");
        logger.info(`Para: ${options.to}`);
        logger.info(`Asunto: ${options.subject}`);
        return true;
      }
    };
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// función genérica de envío
export const enviarCorreo = async (to, subject, html) => {
  try {
    const transporter = crearTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });

    logger.info(`Correo enviado a ${to}`);
  } catch (error) {
    logger.error("Error enviando correo:", error.message);
    throw error;
  }
};

// genera un código numérico de 6 dígitos como string
export const generarCodigo = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// helpers específicos para el flujo de verificación y recuperación
export const enviarCodigoVerificacion = async (to, nombre, codigo) => {
  const subject = "Verificación de correo - Aldia";
  const html = `
    <p>Hola ${nombre},</p>
    <p>Tu código de verificación es <strong>${codigo}</strong>.</p>
    <p>Este código expira en 15 minutos.</p>
  `;
  return enviarCorreo(to, subject, html);
};

export const enviarCodigoRecuperacion = async (to, nombre, codigo) => {
  const subject = "Recuperar contraseña - Aldia";
  const html = `
    <p>Hola ${nombre},</p>
    <p>Usa el siguiente código para recuperar tu contraseña: <strong>${codigo}</strong>.</p>
    <p>Este código expira en 15 minutos.</p>
  `;
  return enviarCorreo(to, subject, html);
};