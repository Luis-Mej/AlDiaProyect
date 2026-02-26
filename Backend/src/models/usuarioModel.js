import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // <-- Importamos bcrypt

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Aseguramos que la contraseña NO se devuelva por defecto en las consultas
    contrasena: { type: String, required: true, select: false },
    // Campos de verificación de email
    verificado: { type: Boolean, default: false },
    codigoVerificacion: { type: String, select: false },
    codigoVerificacionExpira: { type: Date, select: false },
    // Campos para recuperación de contraseña (código temporal / OTP)
    resetCodigo: { type: String, select: false },
    resetCodigoExpira: { type: Date, select: false },
    // Campo para suscripción freemium
    suscripcion: { type: String, enum: ['free', 'premium'], default: 'free' }
}, { timestamps: true });

// Middleware PRE-SAVE: Hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
    // Solo hashea si la contraseña ha sido modificada (o es nueva)
    if (!this.isModified('contrasena')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.contrasena = await bcrypt.hash(this.contrasena, salt);
        next();
    } catch (error) {
        next(error); 
    }
});

// Método para comparar la contraseña en el login
usuarioSchema.methods.compararContrasena = async function(contrasenaIngresada) {
    // 'this.contrasena' es la contraseña hasheada en la base de datos
    return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

export default mongoose.model("Usuario", usuarioSchema);