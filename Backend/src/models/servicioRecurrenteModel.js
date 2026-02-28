import mongoose from "mongoose";

const servicioRecurrenteSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    index: true
  },
  nombre: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ["servicios_basicos", "prestamo", "suscripcion", "hogar", "otro"],
    required: true
  },
  frecuencia: {
    type: String,
    enum: ["mensual", "bimestral", "trimestral", "anual"],
    default: "mensual"
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// ensure user cannot create two services with the same nombre
servicioRecurrenteSchema.index({ usuarioId: 1, nombre: 1 }, { unique: true });

export default mongoose.model("ServicioRecurrente", servicioRecurrenteSchema);