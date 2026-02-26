import servicioModel from "../models/servicioModel.js";

export const crearServicioService = async (data) => {
    const servicio = new servicioModel(data);
    await servicio.save();
    return servicio;
};

export const obtenerServiciosService = async () => {
    return await servicioModel.find();
};

export const actualizarServicioService = async (id, data) => {
    const servicio = await servicioModel.findById(id);
    if (!servicio) throw new Error("Servicio no encontrado");

    Object.assign(servicio, data);
    await servicio.save();
    return servicio;
};

export const eliminarServicioService = async (id) => {
    const servicio = await servicioModel.findById(id);
    if (!servicio) throw new Error("Servicio no encontrado");

    await servicio.deleteOne();
    return { mensaje: "Servicio eliminado" };
};
