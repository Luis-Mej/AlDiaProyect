import { body, validationResult, query } from 'express-validator';

// Middleware para manejar errores de validación
export const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errores: errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg,
      })),
    });
  }
  next();
};

// Validaciones para registro
export const validarRegistro = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),
  
  body('contrasena')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número'),
];

// Validaciones para login
export const validarLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),
  
  body('contrasena')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

// Validaciones para solicitar recuperación de contraseña
export const validarSolicitarRecuperacion = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),
];

// Validaciones para resetear contraseña con código
export const validarResetContrasena = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),
  body('codigo')
    .trim()
    .notEmpty()
    .withMessage('El código de recuperación es requerido'),
  body('nuevaContrasena')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número'),
];

// Validaciones para actualizar usuario
export const validarActualizarUsuario = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),
  
  body('contrasena')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// Validaciones para crear servicio
export const validarCrearServicio = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no debe exceder 500 caracteres'),
];

// Validaciones para crear servicio de usuario
export const validarCrearServicioUsuario = [
  body('servicio')
    .trim()
    .isIn(['cnel', 'interagua'])
    .withMessage('El servicio debe ser "cnel" o "interagua"'),
  
  body('cuenta')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La cuenta es requerida y no debe exceder 50 caracteres'),
];

// Validaciones para consultas
export const validarConsulta = [
  query('servicio')
    .trim()
    .toLowerCase()
    .isIn(['cnel', 'interagua'])
    .withMessage('El servicio debe ser "cnel" o "interagua"'),
  
  query('cuenta')
    .trim()
    .notEmpty()
    .withMessage('La cuenta es requerida'),
];
