import mongoose from "mongoose";

const serviciosUsuarioSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    servicio: {
        type: String,
        enum: ["cnel", "interagua"],
        required: true,
    },
    cuenta: {
        type: String,
        required: true
    },
    // Almacenará el resultado de la ÚLTIMA consulta exitosa para comparaciones futuras.
    ultimoResultado: {
        type: Object, 
        default: null
    },
}, { timestamps: true });

export default mongoose.model("ServicioUsuario", serviciosUsuarioSchema);