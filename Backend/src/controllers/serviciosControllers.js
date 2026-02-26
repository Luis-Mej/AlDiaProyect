import {
    crearServicioService,
    obtenerServiciosService,
    actualizarServicioService,
    eliminarServicioService
} from "../services/servicioService.js";

export const crearServicio = async (req, res) => {
    try {
        const servicio = await crearServicioService(req.body);
        res.json({ ok: true, data: servicio });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

export const obtenerServicios = async (req, res) => {
    try {
        const servicios = await obtenerServiciosService();
        res.json({ ok: true, data: servicios });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};

export const actualizarServicio = async (req, res) => {
    try {
        const servicio = await actualizarServicioService(req.params.id, req.body);
        res.json({ ok: true, data: servicio });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};

export const eliminarServicio = async (req, res) => {
    try {
        const respuesta = await eliminarServicioService(req.params.id);
        res.json({ ok: true, data: respuesta });
    } catch (error) {
        res.status(400).json({ ok: false, error: error.message });
    }
};
