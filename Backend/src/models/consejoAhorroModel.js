import mongoose from "mongoose";

const consejoAhorroSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    index: true
  },
  contenido: {
    type: String,
    required: true,
    trim: true
  },
  usadoEnRecordatorio: {
    type: Boolean,
    default: false
  },
  tipo: {
    type: String,
    enum: ["general", "suscripciones", "servicios", "prestamo", "ahorro"],
    default: "general"
  }
}, { timestamps: true });

export default mongoose.model("ConsejoAhorro", consejoAhorroSchema);