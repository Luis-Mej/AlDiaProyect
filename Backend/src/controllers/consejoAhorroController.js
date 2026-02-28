import ConsejoAhorro from "../models/consejoAhorroModel.js";
import Usuario from "../models/usuarioModel.js";
import { analizarFinanzasConIA } from "../services/asistenteIAService.js";
import GastoMensual from "../models/gastoMensualModel.js";

// ===============================
// 🧠 Generar y guardar consejo
// ===============================
export const generarYGuardarConsejo = async (req, res, next) => {
  try {
    if (!req.usuario?.id) {
      const error = new Error("No autorizado");
      error.statusCode = 1;
      error.statusCode = 401;
      throw error;
    }

    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // ===============================
    // 💎 Validación Freemium
    // ===============================

    // Reset automático diario
    usuario.verificarResetDiario();

    if (usuario.suscripcion === "free") {
      if (usuario.consejosGeneradosHoy >= usuario.limiteConsejosDiarios) {
        const error = new Error(
          "Has alcanzado el límite diario de consejos. Actualiza a Premium."
        );
        error.statusCode = 403;
        throw error;
      }
    }

    // ===============================
    // 🤖 Generación IA
    // ===============================

    let consejoGenerado;

    try {
      // pasamos datos útiles al servicio de IA, por ejemplo gastos recientes
      consejoGenerado = await analizarFinanzasConIA({ usuarioId: usuario._id });
    } catch (errorIA) {
      console.error("Error IA:", errorIA.message);
      consejoGenerado = "Reduce gastos innecesarios este mes.";
    }

    // ===============================
    // 💾 Guardar consejo
    // ===============================

    const nuevoConsejo = await ConsejoAhorro.create({
      usuarioId: usuario._id,
      contenido: consejoGenerado
    });

    // ===============================
    // 📊 Incrementar contador (solo free)
    // ===============================

    if (usuario.suscripcion === "free") {
      usuario.consejosGeneradosHoy += 1;
    }

    await usuario.save();

    res.status(201).json({
      ok: true,
      mensaje: "Consejo generado correctamente",
      consejosRestantes:
        usuario.suscripcion === "free"
          ? usuario.limiteConsejosDiarios - usuario.consejosGeneradosHoy
          : "Ilimitado",
      data: nuevoConsejo
    });

  } catch (error) {
    next(error);
  }
};

// ===============================
// 📄 Obtener consejos del usuario
// ===============================
export const obtenerConsejosUsuario = async (req, res, next) => {
  try {
    if (!req.usuario?.id) {
      const error = new Error("No autorizado");
      error.statusCode = 401;
      throw error;
    }

    const consejos = await ConsejoAhorro
      .find({ usuarioId: req.usuario.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      ok: true,
      total: consejos.length,
      data: consejos
    });

  } catch (error) {
    next(error);
  }
};

// alias export usado por rutas
export const generarConsejo = generarYGuardarConsejo;

// análisis completo (segundo nivel)
export const obtenerAnalisisCompleto = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id;

    const gastos = await GastoMensual.find({ usuarioId }).populate('servicioId');

    if (!gastos.length) {
      return res.json({
        ok: true,
        data: {
          resumen: null,
          analisisPorServicio: [],
          recomendaciones: []
        }
      });
    }

    const total = gastos.reduce((sum, g) => sum + g.monto, 0);
    const promedio = total / gastos.length;

    // Agrupar por servicio
    const porServicio = {};

    gastos.forEach(g => {
      const serv =
        (g.servicioId && g.servicioId.nombre) ||
        g.servicioNombre ||
        "otro";

      if (!porServicio[serv]) {
        porServicio[serv] = {
          cantidad: 0,
          total: 0
        };
      }

      porServicio[serv].cantidad++;
      porServicio[serv].total += g.monto;
    });

    const analisisPorServicio = Object.keys(porServicio).map(serv => ({
      servicio: serv,
      cantidad: porServicio[serv].cantidad,
      gastoTotal: porServicio[serv].total,
      gastoPorPago: porServicio[serv].total / porServicio[serv].cantidad
    }));

    // Recomendaciones simples
    const recomendaciones = analisisPorServicio.map(s => ({
      prioridad: s.gastoPorPago > promedio ? "alta" : "media",
      tipo: "servicio",
      mensaje: `Tu gasto en ${s.servicio} es $${s.gastoPorPago.toFixed(2)}.`,
      ahorroPotencial: s.gastoPorPago * 0.1
    }));

    res.json({
      ok: true,
      data: {
        resumen: {
          gastoTotal: total,
          gastoPromedio: promedio,
          recordatoriosCompletados: gastos.length,
          totalRecordatorios: gastos.length
        },
        analisisPorServicio,
        recomendaciones
      }
    });

  } catch (error) {
    next(error);
  }
};