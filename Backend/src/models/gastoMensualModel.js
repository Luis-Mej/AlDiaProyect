import mongoose from "mongoose";

const gastoMensualSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    index: true
  },
  servicioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServicioRecurrente",
    required: true
  },
  anio: {
    type: Number,
    required: true
  },
  mes: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  monto: {
    type: Number,
    required: true,
    min: 0
  },
  pagado: {
    type: Boolean,
    default: false
  },
  fechaPago: {
    type: Date
  },
  variacion: {
    type: Number
  }
}, { timestamps: true });

gastoMensualSchema.index(
  { usuarioId: 1, servicioId: 1, anio: 1, mes: 1 },
  { unique: true }
);

export default mongoose.model("GastoMensual", gastoMensualSchema);