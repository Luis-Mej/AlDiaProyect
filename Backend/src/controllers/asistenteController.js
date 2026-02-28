import { analizarFinanzasConIA } from "../services/asistenteIAService.js";
import GastoMensual from "../models/gastoMensualModel.js";
import ServicioRecurrente from "../models/servicioRecurrenteModel.js";

// ===============================
// 🤖 Funciones de asistente conversacional
// ===============================

export const generarRespuesta = async (req, res, next) => {
  try {
    const { pregunta } = req.body;

    if (!pregunta) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se proporcionó ninguna pregunta"
      });
    }

    // 🔹 Por ahora solo devuelve la misma pregunta
    res.json({
      ok: true,
      respuesta: pregunta
    });

  } catch (error) {
    next(error);
  }
};

export const obtenerHistorial = async (req, res, next) => {
  try {
    // 🔹 Aún no hay persistencia de conversaciones
    res.json({
      ok: true,
      data: []
    });

  } catch (error) {
    next(error);
  }
};

export const eliminarConversacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID de conversación no proporcionado"
      });
    }

    // 🔹 Cuando tengas modelo:
    // await Conversacion.findByIdAndDelete(id);

    res.json({
      ok: true,
      mensaje: `Conversación ${id} eliminada correctamente`
    });

  } catch (error) {
    next(error);
  }
};

// ===============================
// 📊 Análisis de servicios y gastos con IA
// ===============================

export const analizarServiciosController = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        ok: false,
        mensaje: "No autorizado"
      });
    }

    // 🔎 Obtener servicios recurrentes del usuario
    const servicios = await ServicioRecurrente.find({ usuarioId });

    // 🔎 Obtener gastos mensuales del usuario (poblar servicioId para nombre)
    const gastos = await GastoMensual.find({ usuarioId }).populate('servicioId');

    // Validar si no hay servicios ni gastos
    if (!servicios.length && !gastos.length) {
      console.log("No hay servicios ni gastos registrados para analizar.");
      return res.json({
        ok: true,
        analisis: "No hay servicios ni gastos registrados para analizar.",
        detalles: []
      });
    }

    // Verificar datos antes de enviarlos a analizarFinanzasConIA
    if (!datosParaIA || datosParaIA.length === 0) {
      console.log("Datos para IA están vacíos: ", datosParaIA);
      return res.json({
        ok: true,
        analisis: "No hay datos suficientes para realizar el análisis.",
        detalles: []
      });
    }

    // ==========================
    // 📊 PROCESAR DATOS
    // ==========================

    const resumen = {};

    gastos.forEach(g => {
      // si existe referencia poblada, usar su nombre
      const servicio =
        (g.servicioId && g.servicioId.nombre) ||
        g.servicioNombre ||
        "otro";

      if (!resumen[servicio]) {
        resumen[servicio] = {
          total: 0,
          pagos: 0
        };
      }

      resumen[servicio].total += g.monto;
      resumen[servicio].pagos += 1;
    });

    // 🔹 Calcular promedios por servicio
    const datosParaIA = Object.keys(resumen).map(serv => ({
      servicio: serv,
      gastoPromedio: resumen[serv].total / resumen[serv].pagos,
      pagos: resumen[serv].pagos
    }));

    // ==========================
    // 🤖 ANÁLISIS CON IA
    // ==========================

    const analisisIA = await analizarFinanzasConIA(datosParaIA);

    // ==========================
    // 📦 DETALLES PARA FRONTEND
    // ==========================

    let detalles = datosParaIA.map(d => ({
      servicio: d.servicio,
      ok: true,
      saldoActual: d.gastoPromedio,
      saldoPasado: null, // aún no hay histórico
      variacion: 0
    }));

    // asegurar que aparezca cada servicio recurrente aunque no tenga gastos
    servicios.forEach((s) => {
      const nombre = s.nombre || '';
      if (!detalles.some((d) => d.servicio.toLowerCase() === nombre.toLowerCase())) {
        detalles.push({
          servicio: nombre,
          ok: true,
          saldoActual: 0,
          saldoPasado: null,
          variacion: 0
        });
      }
    });

    res.json({
      ok: true,
      analisis: analisisIA,
      detalles
    });

  } catch (error) {
    next(error);
  }
};