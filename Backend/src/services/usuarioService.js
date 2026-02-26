import usuarioModel from "../models/usuarioModel.js";
import bcrypt from "bcryptjs";

export const crearUsuarioService = async (nombre, email, contrasena) => {
    const existe = await usuarioModel.findOne({ email });
    if (existe) throw new Error("El usuario ya existe");

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const nuevoUsuario = new usuarioModel({
        nombre,
        email,
        contrasena: contrasenaHash
    });

    await nuevoUsuario.save();
    return nuevoUsuario;
};

export const obtenerUsuariosService = async () => {
    return await usuarioModel.find();
};
