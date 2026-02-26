import mongoose from "mongoose";

const recordatorioSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    index: true
  },
  servicio: {
    type: String,
    required: true,
    enum: ["cnel", "interagua"],
    lowercase: true
  },
  cuenta: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: null
  },
  fechaPago: {
    type: Date,
    required: true,
    description: "Fecha en la que vence el pago"
  },
  fechaRecordatorio: {
    type: Date,
    required: true,
    description: "Fecha cuando se envía la notificación (típicamente 2 días antes)"
  },
  estado: {
    type: String,
    enum: ["activo", "completado", "vencido"],
    default: "activo"
  },
  notificacionEnviada: {
    type: Boolean,
    default: false,
    description: "Indica si ya se envió la notificación"
  },
  monto: {
    type: Number,
    default: null,
    description: "Monto aproximado a pagar (opcional)"
  },
  notas: {
    type: String,
    default: null
  },
  diasAntes: {
    type: Number,
    default: 2,
    description: "Días antes de la fecha de pago para enviar notificación"
  },
  horaNotificacion: {
    type: String,
    default: "09:00",
    description: "Hora en formato HH:mm para enviar la notificación"
  },
  categoria: {
    type: String,
    enum: ["servicios_basicos", "prestamo", "suscripcion", "otro"],
    default: "servicios_basicos"
  },
  frecuencia: {
    type: String,
    enum: ["unica", "mensual", "bimestral", "trimestral", "anual"],
    default: "mensual"
  },
  consejosAhorro: {
    type: [{
      titulo: String,
      descripcion: String,
      ahorroPotencial: String,
      generadoEn: Date
    }],
    default: []
  },
  patronesConsumoBefore: {
    type: Object,
    default: null,
    description: "Datos de consumo del mes anterior para análisis de IA"
  },
  patronesConsumoAfter: {
    type: Object,
    default: null,
    description: "Datos de consumo del mes actual para análisis de IA"
  }
}, { timestamps: true });

// Índice para búsquedas frecuentes
recordatorioSchema.index({ usuarioId: 1, estado: 1 });
recordatorioSchema.index({ fechaRecordatorio: 1, notificacionEnviada: 1 });
recordatorioSchema.index({ usuarioId: 1, fechaPago: 1 });

export default mongoose.model("Recordatorio", recordatorioSchema);
