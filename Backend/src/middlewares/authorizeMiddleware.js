import jwt from "jsonwebtoken";
import Usuario from "../models/usuarioModel.js";

/* =========================================
   Helper interno para obtener usuarioId
========================================= */
const getUsuarioId = (req) =>
  req.usuario?.id || req.usuario?.sub || req.usuario?._id;

/* =========================================
   Verificar Token JWT
========================================= */
export const verificarToken = (req, res, next) => {
  const header = req.headers.authorization; // 🔥 CAMBIO CLAVE

  if (!header) {
    return res.status(401).json({ ok: false, mensaje: "Token faltante" });
  }

  const token = header.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, mensaje: "Token no válido" });
  }
};

/* =========================================
   Verificar Suscripción Premium
========================================= */
export const verificarPremium = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, mensaje: "Usuario no autenticado" });
    }

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    // Si está en premium pero vencido → degradar automáticamente
    if (
      usuario.suscripcion === "premium" &&
      usuario.fechaVencimientoPremium &&
      new Date() > usuario.fechaVencimientoPremium
    ) {
      usuario.suscripcion = "free";
      usuario.fechaVencimientoPremium = null;
      await usuario.save();
    }

    if (usuario.suscripcion !== "premium") {
      return res.status(403).json({
        ok: false,
        mensaje: "Esta funcionalidad requiere suscripción premium"
      });
    }

    next();

  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: "Error del servidor" });
  }
};

// Para compatibilidad con importación default en algunas rutas
export default verificarToken;