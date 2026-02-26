import logger from './logger.js';

export const handleErrors = (err, req, res, next) => {
    // Loguear el error
    logger.error({
        mensaje: err.message,
        stack: err.stack,
        ruta: req.path,
        metodo: req.method,
        ip: req.ip,
    });

    // Determinar código de estado
    const statusCode = err.statusCode || err.status || 500;
    const mensaje = err.message || 'Error interno del servidor';

    // Diferentes tipos de errores
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            ok: false,
            error: 'Error de validación',
            detalles: err.message,
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            ok: false,
            error: 'ID inválido',
        });
    }

    if (err.code === 11000) {
        const campo = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            ok: false,
            error: `El campo "${campo}" ya existe`,
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            ok: false,
            error: 'Token inválido',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            ok: false,
            error: 'Token expirado',
        });
    }

    // Error genérico
    res.status(statusCode).json({
        ok: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : mensaje,
    });
};
