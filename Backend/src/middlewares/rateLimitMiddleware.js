import rateLimit from 'express-rate-limit';

// Limitador general (15 requests por 15 minutos)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador estricto para login (5 intentos por 15 minutos)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de inicio de sesión, intente más tarde.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador para registro (3 registros por hora)
export const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Demasiados registros desde esta IP, intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador para consultas (30 por 10 minutos)
export const consultasLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'Demasiadas consultas, intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador para recordatorios (50 por 15 minutos)
export const recordatoriosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Demasiadas solicitudes de recordatorios, intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
