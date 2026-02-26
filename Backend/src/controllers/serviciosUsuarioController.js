import ServicioUsuario from "../models/serviciosUsuarioModel.js";

// CREAR NUEVO SERVICIO
export const crearServicioUsuario = async (req, res) => {
    try {
        const { servicio, cuenta } = req.body;

        if (!servicio || !cuenta) {
            return res.status(400).json({ mensaje: "Datos incompletos" });
        }

        // Verificar si ya existe el mismo servicio para este usuario
        const existe = await ServicioUsuario.findOne({
            usuarioId: req.usuario.id,
            servicio,
            cuenta
        });

        if (existe) {
            return res.status(400).json({ mensaje: "Este servicio ya está guardado" });
        }

        const nuevo = await ServicioUsuario.create({
            usuarioId: req.usuario.id,
            servicio,
            cuenta
        });

        res.status(201).json({ mensaje: "Servicio guardado", servicio: nuevo });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// OBTENER SERVICIOS DEL USUARIO
export const obtenerServiciosUsuario = async (req, res) => {
    try {
        const servicios = await ServicioUsuario.find({
            usuarioId: req.usuario.id
        });

        res.json(servicios);
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// ELIMINAR SERVICIO
export const eliminarServicioUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const eliminado = await ServicioUsuario.findOneAndDelete({
            _id: id,
            usuarioId: req.usuario.id
        });

        if (!eliminado) {
            return res.status(404).json({ mensaje: "No existe este servicio" });
        }

        res.json({ mensaje: "Servicio eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};
