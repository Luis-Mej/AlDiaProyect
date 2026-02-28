import usuarioModel from "../models/usuarioModel.js";
import bcrypt from "bcrypt";

export const obtenerUsuariosService = async () => {
  return await usuarioModel.find().select("-contrasena");
};

export const obtenerUsuarioPorIdService = async (id) => {
  return await usuarioModel.findById(id).select("-contrasena");
};

export const crearUsuarioService = async (data) => {
  const { nombre, correo, contrasena } = data;

  const existe = await usuarioModel.findOne({ correo });
  if (existe) {
    throw new Error("El correo ya está registrado");
  }

  const hash = await bcrypt.hash(contrasena, 10);

  const nuevoUsuario = new usuarioModel({
    nombre,
    correo,
    contrasena: hash
  });

  return await nuevoUsuario.save();
};

export const actualizarUsuarioService = async (id, data) => {
  if (data.contrasena) {
    data.contrasena = await bcrypt.hash(data.contrasena, 10);
  }

  return await usuarioModel.findByIdAndUpdate(
    id,
    data,
    { new: true }
  ).select("-contrasena");
};

export const eliminarUsuarioService = async (id) => {
  return await usuarioModel.findByIdAndDelete(id);
};