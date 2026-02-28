import { body, validationResult } from "express-validator";

// =====================================
// 🔎 Middleware para manejar errores
// =====================================

export const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errores: errors.array().map((err) => ({
        campo: err.path,
        mensaje: err.msg,
      })),
    });
  }

  next();
};

// =====================================
// 👤 VALIDACIONES USUARIO
// =====================================

export const validarRegistro = [
  body("nombre")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail(),

  body("contrasena")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Z]/)
    .withMessage("Debe contener al menos una mayúscula")
    .matches(/[0-9]/)
    .withMessage("Debe contener al menos un número"),
];

export const validarLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail(),

  body("contrasena")
    .notEmpty()
    .withMessage("La contraseña es requerida"),
];

export const validarActualizarUsuario = [
  body("nombre")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail(),

  body("contrasena")
    .optional()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

// =====================================
// 🔐 RECUPERACIÓN DE CONTRASEÑA
// =====================================

export const validarSolicitarRecuperacion = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail(),
];

export const validarResetContrasena = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail(),

  body("codigo")
    .trim()
    .notEmpty()
    .withMessage("El código es requerido"),

  body("nuevaContrasena")
    .isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres")
    .matches(/[A-Z]/)
    .withMessage("Debe contener al menos una mayúscula")
    .matches(/[0-9]/)
    .withMessage("Debe contener al menos un número"),
];

// =====================================
// 💰 SERVICIOS DEL USUARIO (GENÉRICO)
// =====================================

export const validarCrearServicioUsuario = [
  body("nombre")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre del servicio debe tener entre 2 y 100 caracteres"),

  body("categoria")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("La categoría no debe exceder 100 caracteres"),

  body("montoEstimado")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto estimado debe ser un número válido"),
];

// =====================================
// 🔔 RECORDATORIOS
// =====================================

export const validarRecordatorio = [
  body("titulo")
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("El título debe tener entre 2 y 150 caracteres"),

  body("monto")
    .isFloat({ min: 0 })
    .withMessage("El monto debe ser un número válido"),

  body("fecha")
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)"),
];