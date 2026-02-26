import recordatorioModel from "../models/recordatorioModel.js";

/**
 * GET /recordatorios
 * Obtener todos los recordatorios del usuario autenticado
 */
export const obtenerRecordatorios = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    if (!usuarioId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const recordatorios = await recordatorioModel
      .find({ usuarioId })
      .sort({ fechaRecordatorio: 1 });

    res.json({ ok: true, data: recordatorios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /recordatorios/:id
 * Obtener un recordatorio específico
 */
export const obtenerRecordatorioPorId = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    const { id } = req.params;

    const recordatorio = await recordatorioModel.findOne({
      _id: id,
      usuarioId
    });

    if (!recordatorio) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    res.json({ ok: true, data: recordatorio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /recordatorios
 * Crear un nuevo recordatorio
 * Body: { servicio, cuenta, fechaPago, descripcion?, monto?, notas? }
 */
export const crearRecordatorio = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    if (!usuarioId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { servicio, cuenta, fechaPago, descripcion, monto, notas } = req.body;

    if (!servicio || !cuenta || !fechaPago) {
      return res.status(400).json({
        error: "Campos requeridos: servicio, cuenta, fechaPago"
      });
    }

    // Calcular fechaRecordatorio (2 días antes de fechaPago)
    const fechaPagoDate = new Date(fechaPago);
    const fechaRecordatorioDate = new Date(fechaPagoDate);
    fechaRecordatorioDate.setDate(fechaRecordatorioDate.getDate() - 2);

    const recordatorio = await recordatorioModel.create({
      usuarioId,
      servicio: servicio.toLowerCase(),
      cuenta,
      descripcion,
      fechaPago: fechaPagoDate,
      fechaRecordatorio: fechaRecordatorioDate,
      monto,
      notas
    });

    res.status(201).json({
      ok: true,
      mensaje: "Recordatorio creado exitosamente",
      data: recordatorio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /recordatorios/:id
 * Actualizar un recordatorio existente
 */
export const actualizarRecordatorio = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    const { id } = req.params;
    const actualizaciones = req.body;

    // Verificar que el recordatorio pertenece al usuario
    const recordatorio = await recordatorioModel.findOne({
      _id: id,
      usuarioId
    });

    if (!recordatorio) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    // Si se actualiza fechaPago, recalcular fechaRecordatorio
    if (actualizaciones.fechaPago) {
      const fechaPagoDate = new Date(actualizaciones.fechaPago);
      const fechaRecordatorioDate = new Date(fechaPagoDate);
      fechaRecordatorioDate.setDate(fechaRecordatorioDate.getDate() - 2);
      actualizaciones.fechaRecordatorio = fechaRecordatorioDate;
    }

    const recordatorioActualizado = await recordatorioModel.findByIdAndUpdate(
      id,
      actualizaciones,
      { new: true, runValidators: true }
    );

    res.json({
      ok: true,
      mensaje: "Recordatorio actualizado",
      data: recordatorioActualizado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /recordatorios/:id
 * Eliminar un recordatorio
 */
export const eliminarRecordatorio = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    const { id } = req.params;

    const recordatorio = await recordatorioModel.findOneAndDelete({
      _id: id,
      usuarioId
    });

    if (!recordatorio) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    res.json({
      ok: true,
      mensaje: "Recordatorio eliminado"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /recordatorios/:id/completar
 * Marcar un recordatorio como completado
 */
export const completarRecordatorio = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    const { id } = req.params;

    const recordatorio = await recordatorioModel.findOneAndUpdate(
      { _id: id, usuarioId },
      { estado: "completado" },
      { new: true }
    );

    if (!recordatorio) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    res.json({
      ok: true,
      mensaje: "Recordatorio marcado como completado",
      data: recordatorio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
