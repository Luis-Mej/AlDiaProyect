import mongoose from "mongoose";
import recordatorioModel from "../models/recordatorioModel.js";

/* =====================================================
   Helper: Obtener usuarioId desde JWT
===================================================== */
const getUsuarioId = (req) => {
  return req.usuario?.id || req.usuario?.sub || req.usuario?._id;
};

/* =====================================================
   Helper: Calcular fechaRecordatorio (2 días antes)
===================================================== */
const calcularFechaRecordatorio = (fechaPago) => {
  const fechaPagoDate = new Date(fechaPago);
  const fechaRecordatorioDate = new Date(fechaPagoDate);
  fechaRecordatorioDate.setDate(fechaRecordatorioDate.getDate() - 2);
  return fechaRecordatorioDate;
};

/* =====================================================
   GET /recordatorios
   Obtener todos los recordatorios del usuario
===================================================== */
export const obtenerRecordatorios = async (req, res) => {
  try {
    const usuarioId = getUsuarioId(req);
    if (!usuarioId)
      return res.status(401).json({ ok: false, mensaje: "Usuario no autenticado" });

    const recordatorios = await recordatorioModel
      .find({ usuarioId })
      .sort({ fechaRecordatorio: 1 });

    return res.json({ ok: true, data: recordatorios });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};

/* =====================================================
   GET /recordatorios/:id
===================================================== */
export const obtenerRecordatorioPorId = async (req, res) => {
  try {
    const usuarioId = getUsuarioId(req);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ ok: false, mensaje: "ID inválido" });

    const recordatorio = await recordatorioModel.findOne({
      _id: id,
      usuarioId
    });

    if (!recordatorio)
      return res.status(404).json({ ok: false, mensaje: "Recordatorio no encontrado" });

    return res.json({ ok: true, data: recordatorio });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};

/* =====================================================
   POST /recordatorios
===================================================== */
export const crearRecordatorio = async (req, res) => {
  try {
    const usuarioId = getUsuarioId(req);
    if (!usuarioId)
      return res.status(401).json({ ok: false, mensaje: "Usuario no autenticado" });

    const { servicio, cuenta, fechaPago, descripcion, monto, notas } = req.body;

    if (!servicio || !cuenta || !fechaPago)
      return res.status(400).json({
        ok: false,
        mensaje: "Campos requeridos: servicio, cuenta, fechaPago"
      });

    const fechaPagoDate = new Date(fechaPago);
    const fechaRecordatorio = calcularFechaRecordatorio(fechaPagoDate);

    const nuevoRecordatorio = await recordatorioModel.create({
      usuarioId,
      servicio: servicio.toLowerCase().trim(),
      cuenta,
      descripcion,
      fechaPago: fechaPagoDate,
      fechaRecordatorio,
      monto,
      notas,
      estado: "pendiente"
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Recordatorio creado exitosamente",
      data: nuevoRecordatorio
    });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};

/* =====================================================
   PUT /recordatorios/:id
===================================================== */
export const actualizarRecordatorio = async (req, res) => {
  try {
    const usuarioId = getUsuarioId(req);
    const { id } = req.params;
    const actualizaciones = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ ok: false, mensaje: "ID inválido" });

    const recordatorioExistente = await recordatorioModel.findOne({
      _id: id,
      usuarioId
    });

    if (!recordatorioExistente)
      return res.status(404).json({ ok: false, mensaje: "Recordatorio no encontrado" });

    if (actualizaciones.fechaPago) {
      actualizaciones.fechaPago = new Date(actualizaciones.fechaPago);
      actualizaciones.fechaRecordatorio =
        calcularFechaRecordatorio(actualizaciones.fechaPago);
    }

    const actualizado = await recordatorioModel.findByIdAndUpdate(
      id,
      actualizaciones,
      { new: true, runValidators: true }
    );

    return res.json({
      ok: true,
      mensaje: "Recordatorio actualizado correctamente",
      data: actualizado
    });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};

/* =====================================================
   DELETE /recordatorios/:id
===================================================== */
export const eliminarRecordatorio = async (req, res) => {
  try {
    const usuarioId = getUsuarioId(req);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ ok: false, mensaje: "ID inválido" });

    const eliminado = await recordatorioModel.findOneAndDelete({
      _id: id,
      usuarioId
    });

    if (!eliminado)
      return res.status(404).json({ ok: false, mensaje: "Recordatorio no encontrado" });

    return res.json({
      ok: true,
      mensaje: "Recordatorio eliminado correctamente"
    });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};

/* =====================================================
   PATCH /recordatorios/:id/completar
===================================================== */
export const completarRecordatorio = async (req, res) => {
  try {
    const usuarioId = getUsuarioId(req);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ ok: false, mensaje: "ID inválido" });

    const actualizado = await recordatorioModel.findOneAndUpdate(
      { _id: id, usuarioId },
      { estado: "completado" },
      { new: true }
    );

    if (!actualizado)
      return res.status(404).json({ ok: false, mensaje: "Recordatorio no encontrado" });

    return res.json({
      ok: true,
      mensaje: "Recordatorio marcado como completado",
      data: actualizado
    });
  } catch (error) {
    return res.status(500).json({ ok: false, mensaje: error.message });
  }
};