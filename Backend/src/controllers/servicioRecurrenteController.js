import ServicioRecurrente from "../models/servicioRecurrenteModel.js";

// Crear servicio
export const crearServicio = async (req, res) => {
  try {
    let { nombre, categoria, frecuencia } = req.body;

    const usuarioId = req.usuario?.id;

    // ensure category is one of allowed enum values; unknown ones map to 'otro'
    const valid = [
      'servicios_basicos',
      'prestamo',
      'suscripcion',
      'hogar',
      'otro'
    ];
    if (!valid.includes(categoria)) {
      categoria = 'otro';
    }

    if (!usuarioId) {
      return res.status(401).json({
        ok: false,
        mensaje: "Usuario no autenticado"
      });
    }

    // check for existing service with same nombre for this user
    const existe = await ServicioRecurrente.findOne({ usuarioId, nombre });
    if (existe) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe un servicio con ese nombre'
      });
    }

    const nuevoServicio = await ServicioRecurrente.create({
      usuarioId,
      nombre,
      categoria,
      frecuencia
    });

    res.status(201).json({
      ok: true,
      data: nuevoServicio
    });

  } catch (error) {
    // duplicate key error (in case race)
    if (error.code === 11000) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe un servicio con ese nombre (clave única)'
      });
    }
    // validation errors come from mongoose and should be reported as 400
    if (error.name === 'ValidationError') {
      console.error('Validation error creating servicio:', error.message);
      return res.status(400).json({
        ok: false,
        mensaje: 'Datos inválidos para servicio',
        error: error.message
      });
    }

    console.error('Unexpected error creating servicio:', error);
    res.status(500).json({
      ok: false,
      message: "Error al crear servicio",
      error: error.message
    });
  }
};

// Listar servicios
export const listarServicios = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        ok: false,
        mensaje: "Usuario no autenticado"
      });
    }

    const servicios = await ServicioRecurrente
      .find({ usuarioId })
      .sort({ createdAt: -1 });

    return res.json({
      ok: true,
      total: servicios.length,
      data: servicios
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: "Error al listar servicios",
      error: error.message
    });
  }
};

// Eliminar servicio
export const eliminarServicio = async (req, res) => {
  try {
    await ServicioRecurrente.findByIdAndDelete(req.params.id);
    res.json({ message: "Servicio eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar servicio", error });
  }
};