import logger from './logger.js';

export const handleErrors = (err, req, res, next) => {
  // ===============================
  // 📝 Log estructurado
  // ===============================
  logger.error({
    mensaje: err.message,
    stack: err.stack,
    ruta: req.originalUrl,
    metodo: req.method,
    ip: req.ip,
  });

  const statusCode = err.statusCode || err.status || 500;
  const mensaje =
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor. Por favor, contacte al soporte.'
      : err.message;

  // ===============================
  // 🔍 Errores específicos
  // ===============================

  // Validación Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error de validación',
      detalles: err.message,
    });
  }

  // ID inválido
  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      mensaje: 'ID inválido',
    });
  }

  // Duplicados MongoDB
  if (err.code === 11000) {
    const campo = err.keyPattern
      ? Object.keys(err.keyPattern)[0]
      : 'campo';

    return res.status(400).json({
      ok: false,
      mensaje: `El campo "${campo}" ya existe`,
    });
  }

  // JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido',
    });
  }

  // JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token expirado',
    });
  }

  // ===============================
  // ❌ Error genérico
  // ===============================
  return res.status(statusCode).json({
    ok: false,
    mensaje,
  });
};