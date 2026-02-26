import mongoose from "mongoose";

const servicioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    estado: { type: Boolean, default: true }
});

export default mongoose.model("Servicio", servicioSchema);
