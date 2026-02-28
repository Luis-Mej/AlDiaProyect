import mongoose from "mongoose";

const asistenteSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    index: true
  },
  pregunta: {
    type: String,
    required: true
  },
  respuesta: {
    type: String,
    required: true
  },
  tokensUsados: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model("Asistente", asistenteSchema);