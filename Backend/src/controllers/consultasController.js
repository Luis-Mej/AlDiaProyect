import ServicioRecurrente from "../models/servicioRecurrenteModel.js";

// consulta directa sin autenticación
export const consultaDirecta = async (req, res, next) => {
  try {
    const { servicio, cuenta } = req.query;

    if (!servicio || !cuenta) {
      return res.status(400).json({ ok: false, mensaje: "Parámetros servicio y cuenta son requeridos" });
    }

    // respuesta simulada - reemplazar con integración real
    res.json({
      ok: true,
      servicio: servicio.toUpperCase(),
      cuenta,
      estado: "ACTIVO",
      deuda: 0,
      fechaVencimiento: null
    });
  } catch (error) {
    next(error);
  }
};

// devuelve los servicios guardados del usuario, mando mismos datos como mis-servicios
export const consultarMisServicios = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ ok: false, mensaje: "Usuario no autenticado" });
    }

    const servicios = await ServicioRecurrente.find({ usuarioId }).sort({ createdAt: -1 });
    res.json({ ok: true, data: servicios });
  } catch (error) {
    next(error);
  }
};
