import Usuario from "../models/usuarioModel.js";

export const verificarLimiteConsejos = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub;

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }

    // Premium ilimitado
    if (usuario.suscripcion === "premium") {
      return next();
    }

    const hoy = new Date();
    const ultimaFecha = new Date(usuario.fechaUltimoResetConsejos);

    const mismoDia = hoy.toDateString() === ultimaFecha.toDateString();

    if (!mismoDia) {
      usuario.consejosGeneradosHoy = 0;
      usuario.fechaUltimoResetConsejos = hoy;
    }

    if (usuario.consejosGeneradosHoy >= usuario.limiteConsejosDiarios) {
      return res.status(403).json({
        ok: false,
        mensaje: "Has alcanzado el límite diario de consejos. Actualiza a Premium."
      });
    }

    // Incrementar contador
    usuario.consejosGeneradosHoy += 1;

    await usuario.save();

    next();

  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: "Error al verificar límite" });
  }
};