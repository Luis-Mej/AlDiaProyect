import GastoMensual from "../models/gastoMensualModel.js";
import ServicioRecurrente from "../models/servicioRecurrenteModel.js";


// ===============================
// Crear gasto mensual
// ===============================
export const crearGasto = async (req, res) => {
  try {
    const { servicioId, anio, mes, monto } = req.body;
    const usuarioId = req.usuario.id; // 🔥 viene del token

    const existe = await GastoMensual.findOne({
      usuarioId,
      servicioId,
      anio,
      mes
    });

    if (existe) {
      // returning 409 Conflict makes it clearer to the client that the resource
      // already exists.  The frontend will surface this message to the user and
      // can decide to disable the form instead of endlessly resubmitting.
      return res.status(409).json({ message: "Ya existe registro para ese mes" });
    }

    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anioAnterior = mes === 1 ? anio - 1 : anio;

    const gastoAnterior = await GastoMensual.findOne({
      usuarioId,
      servicioId,
      anio: anioAnterior,
      mes: mesAnterior
    });

    let variacion = null;
    if (gastoAnterior) {
      variacion = monto - gastoAnterior.monto;
    }

    const nuevoGasto = await GastoMensual.create({
      usuarioId,
      servicioId,
      anio,
      mes,
      monto,
      variacion
    });

    res.status(201).json(nuevoGasto);

  } catch (error) {
    // handle mongo duplicate key just in case the manual check above misses it
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe registro para ese mes (clave única violada)",
        error
      });
    }

    // Mongoose validation errors should be returned as 400 so that the client
    // knows the request was malformed.
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, error });
    }

    res.status(500).json({ message: "Error al crear gasto", error });
  }
};


// ===============================
// Marcar como pagado
// ===============================
export const marcarPagado = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const gasto = await GastoMensual.findOne({
      _id: req.params.id,
      usuarioId // 🔒 evita modificar gastos de otro usuario
    });

    if (!gasto) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    gasto.pagado = true;
    gasto.fechaPago = new Date();

    await gasto.save();

    res.json({ message: "Gasto marcado como pagado", gasto });

  } catch (error) {
    res.status(500).json({ message: "Error al actualizar gasto", error });
  }
};


// ===============================
// Listar MIS gastos (sin pasar id)
// ===============================
export const listarMisGastos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const gastos = await GastoMensual.find({ usuarioId })
      .populate("servicioId")
      .sort({ anio: -1, mes: -1 });

    res.json(gastos);

  } catch (error) {
    res.status(500).json({ message: "Error al listar gastos", error });
  }
};


// ===============================
// Agregar servicio manual + gasto
// ===============================
export const agregarServicioManual = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const {
      nombre,
      categoria,
      frecuencia,
      anio,
      mes,
      monto
    } = req.body;

    // 1️⃣ Buscar si el servicio ya existe
    let servicio = await ServicioRecurrente.findOne({
      usuarioId,
      nombre
    });

    // 2️⃣ Si no existe → crearlo
    if (!servicio) {
      servicio = await ServicioRecurrente.create({
        usuarioId,
        nombre,
        categoria,
        frecuencia
      });
    }

    // 3️⃣ Verificar si ya existe gasto ese mes
    const existeGasto = await GastoMensual.findOne({
      usuarioId,
      servicioId: servicio._id,
      anio,
      mes
    });

    if (existeGasto) {
      return res.status(409).json({
        message: "Ya existe gasto para ese mes"
      });
    }

    // 4️⃣ Buscar gasto anterior para variación
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anioAnterior = mes === 1 ? anio - 1 : anio;

    const gastoAnterior = await GastoMensual.findOne({
      usuarioId,
      servicioId: servicio._id,
      anio: anioAnterior,
      mes: mesAnterior
    });

    let variacion = null;
    if (gastoAnterior) {
      variacion = monto - gastoAnterior.monto;
    }

    // 5️⃣ Crear gasto mensual
    const nuevoGasto = await GastoMensual.create({
      usuarioId,
      servicioId: servicio._id,
      anio,
      mes,
      monto,
      variacion
    });

    res.status(201).json({
      message: "Servicio y gasto registrados correctamente",
      servicio,
      gasto: nuevoGasto
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe gasto para ese mes (clave única violada)",
        error
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, error });
    }

    res.status(500).json({
      message: "Error al registrar servicio manual",
      error
    });
  }
};