// src/controllers/consultasController.js
import { consultarCNEL } from "../integrations/cnelScraper.js";
import { consultarInteragua } from "../integrations/interaguaScraper.js";
import ServiciosUsuario from "../models/serviciosUsuarioModel.js";

/**
 * GET /api/consultas?servicio=<cnel|interagua>&cuenta=<valor>
 * Consulta puntual (directa).
 *
 * GET /api/consultas/mis-servicios  (protegido con JWT)
 * - Usa los servicios guardados del usuario y ejecuta scrapers para cada uno.
 */

export const consultarController = async (req, res) => {
  try {
    const servicio = (req.query.servicio || "").toLowerCase();
    const cuenta = req.query.cuenta;
    if (!servicio || !cuenta) {
      return res.status(400).json({ error: "Parámetros requeridos: servicio y cuenta" });
    }

    const options = {
      headless: req.query.debug === "true" ? false : true,
      screenshotOnError: true,
    };

    let resultado;
    if (servicio === "cnel") resultado = await consultarCNEL(cuenta, options);
    else if (servicio === "interagua") resultado = await consultarInteragua(cuenta, options);
    else return res.status(400).json({ error: "Servicio no soportado. Usa 'cnel' o 'interagua'." });

    if (!resultado.ok) {
      // 3) comportamiento B: devolver saldo 0 y mensaje (pero 200)
      const payload = {
        servicio: servicio.toUpperCase(),
        cuenta,
        saldo: 0,
        mensaje: "No se encontró información o hubo un error al consultar",
      };
      if (resultado.screenshot) payload.screenshot = resultado.screenshot;
      return res.status(200).json(payload);
    }

    // Formato A (detallado)
    if (servicio === "cnel") {
      return res.status(200).json({
        servicio: "CNEL",
        cuenta: resultado.cuenta || cuenta,
        estado: resultado.estado || resultado.estadoCuenta || null,
        identificacion: resultado.identificacion || null,
        unidadNegocio: resultado.unidadNegocio || null,
        correo: resultado.correo || null,
        deuda: resultado.deuda ?? resultado.valorAPagar ?? null,
        mesesDeuda: resultado.mesesDeuda ?? null,
        fechaVencimiento: resultado.fechaVencimiento ?? null,
      });
    } else {
      return res.status(200).json({
        servicio: "INTERAGUA",
        cuenta: resultado.cuenta || cuenta,
        saldoActual: resultado.saldoActual ?? resultado.valorAPagar ?? null,
        planillasAdeudadas: resultado.planillasAdeudadas ?? resultado.mesesDeuda ?? null,
        fechaVencimiento: resultado.fechaVencimiento ?? null,
        fechaEmisionUltimaFactura: resultado.fechaEmision ?? null,
        ultimoPago: resultado.ultimoPago ?? null,
        fechaUltimoPago: resultado.fechaUltimoPago ?? null,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const consultarMisServiciosController = async (req, res) => {
  try {
    // req.usuario proviene del middleware verificarToken
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    if (!usuarioId) return res.status(401).json({ ok: false, error: "Usuario no autenticado" });

    // Buscar los servicios guardados por el usuario
    const servicios = await ServiciosUsuario.find({ usuarioId: usuarioId }).lean();

    // Si no tiene servicios
    if (!servicios || servicios.length === 0) {
      return res.json({ ok: true, data: [], mensaje: "No tienes servicios guardados" });
    }

    // Opciones: por defecto headless true; si debug=true en query usa false
    const headless = req.query.debug === "true" ? false : true;
    const results = [];

    // IMPORTANTE: hacemos las consultas en serie para no golpear la web con muchas concurrencias
    for (const s of servicios) {
      // El modelo de ServicioUsuario usa la propiedad 'cuenta'
      if (!s || !s.servicio || !s.cuenta) continue;

      let r;
      if (s.servicio === "cnel") {
        r = await consultarCNEL(s.cuenta, { headless, screenshotOnError: true });
      } else if (s.servicio === "interagua") {
        r = await consultarInteragua(s.cuenta, { headless, screenshotOnError: true });
      } else {
        r = { ok: false, error: "Tipo de servicio no soportado" };
      }

      // Normalizar salida por cada servicio guardado
      // Guardar el último resultado en la colección de servicios del usuario
      try {
        const payloadToStore = {
          ok: !!r.ok,
          servicio: s.servicio,
          cuenta: s.cuenta,
          fetchedAt: new Date(),
          data: r
        };
        await ServiciosUsuario.findByIdAndUpdate(s._id, { ultimoResultado: payloadToStore }, { new: true });
      } catch (e) {
        // No interrumpir la iteración si el guardado falla; simplemente lo registramos en consola
        console.warn("No se pudo guardar ultimoResultado para servicio", s._id, e.message);
      }

      if (!r.ok) {
        results.push({
          servicio: s.servicio.toUpperCase(),
          cuenta: s.cuenta,
          ok: false,
          mensaje: "No se pudo obtener información",
          screenshot: r.screenshot ?? null,
          error: r.error ?? null
        });
      } else {
        if (s.servicio === "cnel") {
          results.push({
            servicio: "CNEL",
            cuenta: s.cuenta,
            ok: true,
            deuda: r.deuda ?? r.valorAPagar ?? null,
            mesesDeuda: r.mesesDeuda ?? null,
            fechaVencimiento: r.fechaVencimiento ?? null,
            unidadNegocio: r.unidadNegocio ?? null,
            identificacion: r.identificacion ?? null,
            raw: r.raw ?? null
          });
        } else {
          results.push({
            servicio: "INTERAGUA",
            cuenta: s.cuenta,
            ok: true,
            saldoActual: r.saldoActual ?? null,
            planillasAdeudadas: r.planillasAdeudadas ?? null,
            fechaVencimiento: r.fechaVencimiento ?? null,
            ultimoPago: r.ultimoPago ?? null,
            raw: r.raw ?? null
          });
        }
      }
    }

    return res.json({ ok: true, data: results });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};
