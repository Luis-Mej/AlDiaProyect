import jwt from "jsonwebtoken";
import Usuario from "../models/usuarioModel.js";

export const verificarToken = (req, res, next) => {
  const header = req.header("Authorization");

  if (!header) {
    return res.status(401).json({ mensaje: "Token faltante" });
  }

  const token = header.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token no válido" });
  }
};

export const verificarPremium = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    if (usuario.suscripcion !== 'premium') {
      return res.status(403).json({ mensaje: "Esta funcionalidad requiere una suscripción premium" });
    }
    next();
  } catch (error) {
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};
