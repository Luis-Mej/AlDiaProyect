import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  contrasena: { type: String, required: true, select: false },

  verificado: { type: Boolean, default: false },
  codigoVerificacion: { type: String, select: false },
  codigoVerificacionExpira: { type: Date, select: false },

  resetCodigo: { type: String, select: false },
  resetCodigoExpira: { type: Date, select: false },

  /* ===============================
     SUSCRIPCIÓN
  =============================== */

  suscripcion: {
    type: String,
    enum: ["free", "premium"],
    default: "free"
  },

  fechaVencimientoPremium: {
    type: Date,
    default: null
  },

  /* ===============================
     LIMITES FREEMIUM
  =============================== */

  limiteServicios: {
    type: Number,
    default: 3
  },

  limiteConsejosDiarios: {
    type: Number,
    default: 5
  },

  consejosGeneradosHoy: {
    type: Number,
    default: 0
  },

  fechaUltimoResetConsejos: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

/* ===============================
   HASH PASSWORD
=============================== */

usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("contrasena")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/* ===============================
   MÉTODO LOGIN
=============================== */

usuarioSchema.methods.compararContrasena = async function (contrasenaIngresada) {
  return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

export default mongoose.model("Usuario", usuarioSchema);