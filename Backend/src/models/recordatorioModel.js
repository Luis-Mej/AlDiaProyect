import mongoose from "mongoose";

const recordatorioSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  servicio: { // Cambiado de servicioId a servicio
    type: String,
    required: true
  },
  fechaPago: {
    type: Date,
    required: true
  },
  diasAntes: {
    type: Number,
    default: 2
  },
  notificacionEnviada: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

recordatorioSchema.index({ fechaPago: 1, notificacionEnviada: 1 });

export default mongoose.model("Recordatorio", recordatorioSchema);