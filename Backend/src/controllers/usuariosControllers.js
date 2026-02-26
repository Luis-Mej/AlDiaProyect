import usuarioModel from "../models/usuarioModel.js";
import jwt from "jsonwebtoken";
import { enviarCodigoVerificacion, enviarCodigoRecuperacion, generarCodigo } from "../utils/emailService.js";

// LOGIN
export const iniciarSesion = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        // 1. Buscar usuario y EXPLICITAMENTE incluir el campo 'contrasena'
        const usuario = await usuarioModel.findOne({ email }).select('+contrasena');
        if (!usuario) {
            return res.status(404).json({ mensaje: "Este usuario no existe" });
        }

        // 2. Usar el método del modelo para comparar la contraseña
        const ok = await usuario.compararContrasena(contrasena);
        if (!ok) {
            return res.status(400).json({ mensaje: "Contraseña incorrecta" });
        }

        // 3. Generar Token JWT
        const token = jwt.sign(
            { id: usuario._id, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "3h" } // Usamos la variable de entorno
        );

        // Clonar el objeto y eliminar la contraseña para la respuesta
        const { contrasena: _, ...data } = usuario.toObject();

        res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            usuario: data,
            token
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// REGISTRO
export const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, contrasena } = req.body;

        const existe = await usuarioModel.findOne({ email });
        if (existe) {
            return res.status(400).json({ mensaje: "El usuario ya existe" });
        }

        // Generar código de verificación
        const codigo = generarCodigo();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 15 * 60000); // 15 minutos

        // El middleware PRE-SAVE del modelo se encargará del hashing
        const usuario = await usuarioModel.create({
            nombre,
            email,
            contrasena,
            codigoVerificacion: codigo,
            codigoVerificacionExpira: expiracion,
            verificado: false
        });

        // Enviar email con código de verificación
        try {
            await enviarCodigoVerificacion(email, nombre, codigo);
        } catch (emailError) {
            console.error('Error enviando email:', emailError);
            // No fallar el registro si el email falla, pero loguear el error
        }

        // Clonar el objeto y eliminar campos sensibles para la respuesta
        const { contrasena: _, codigoVerificacion: __, codigoVerificacionExpira: ___, ...usuarioSinSensibles } = usuario.toObject();

        res.status(201).json({
            mensaje: "Usuario creado correctamente. Por favor verifica tu correo electrónico.",
            usuario: usuarioSinSensibles,
            email: usuario.email  // Devolver el email exacto guardado en BD
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// OBTENER TODOS
export const obtenerUsuarios = async (req, res) => {
    try {
        // La exclusión de 'contrasena' se maneja por defecto en el modelo ahora, 
        // pero .select("-contrasena") es una buena práctica si quitamos el select: false
        const usuarios = await usuarioModel.find().select("-contrasena");
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// OBTENER POR ID
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario = await usuarioModel
            .findById(req.params.id)
            .select("-contrasena");

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// ACTUALIZAR
export const usuarioActualizar = async (req, res) => {
    try {
        const actualizaciones = req.body;

        // Para que el middleware pre('save') del modelo hashee correctamente
        // la contraseña si se modifica, obtenemos el documento, aplicamos
        // los cambios y llamamos a save(). Esto evita usar bcrypt directamente
        // en el controlador y previene que la contraseña se guarde en texto plano.
        const usuarioDoc = await usuarioModel.findById(req.params.id).select('+contrasena');
        if (!usuarioDoc) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Aplicar actualizaciones campo por campo
        const campos = Object.keys(actualizaciones);
        campos.forEach((campo) => {
            // Solo asignar campos definidos
            if (typeof actualizaciones[campo] !== 'undefined') {
                usuarioDoc[campo] = actualizaciones[campo];
            }
        });

        // Guardar para disparar validadores y middleware (p. ej. hashing de contraseña)
        const usuarioActualizado = await usuarioDoc.save();

        // Obtener versión segura (sin contraseña) para la respuesta
        const usuario = await usuarioModel.findById(usuarioActualizado._id).select('-contrasena');

        res.json({ mensaje: "Usuario actualizado", usuario });
    } catch (error) {
        // Manejar errores de duplicidad de email o validación
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: "El correo electrónico ya está en uso." });
        }
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// ELIMINAR
export const usuarioEliminar = async (req, res) => {
    try {
        const usuario = await usuarioModel.findByIdAndDelete(req.params.id);

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// VERIFICAR CÓDIGO
export const verificarCodigo = async (req, res) => {
    try {
        const { email, codigo } = req.body;

        if (!email || !codigo) {
            return res.status(400).json({ mensaje: "Email y código son requeridos" });
        }

        console.log(`[VERIFICACIÓN] Email recibido: "${email}", Código recibido: "${codigo}"`);

        // Buscar usuario con los campos de verificación
        const usuario = await usuarioModel
            .findOne({ email: email.toLowerCase().trim() })
            .select('+codigoVerificacion +codigoVerificacionExpira');

        if (!usuario) {
            console.log(`[VERIFICACIÓN] Usuario NO encontrado para email: "${email}"`);
            // Debug: buscar todos los usuarios para ver qué hay en BD
            const todosLosUsuarios = await usuarioModel.find({}, { email: 1, nombre: 1 });
            console.log('[DEBUG] Usuarios en BD:', todosLosUsuarios);
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        console.log(`[VERIFICACIÓN] Usuario encontrado: ${usuario.nombre} (${usuario.email}), Código en BD: "${usuario.codigoVerificacion}"`);

        // Verificar si ya está verificado
        if (usuario.verificado) {
            return res.status(400).json({ mensaje: "El usuario ya está verificado" });
        }

        // Validar código
        if (usuario.codigoVerificacion !== codigo) {
            console.log(`[VERIFICACIÓN] Código INCORRECTO. Esperado: "${usuario.codigoVerificacion}", Recibido: "${codigo}"`);
            return res.status(400).json({ mensaje: "Código de verificación incorrecto" });
        }

        console.log(`[VERIFICACIÓN] Código CORRECTO`);

        // Validar expiración
        const ahora = new Date();
        if (ahora > usuario.codigoVerificacionExpira) {
            console.log(`[VERIFICACIÓN] Código EXPIRADO. Expiración: ${usuario.codigoVerificacionExpira}, Ahora: ${ahora}`);
            return res.status(400).json({ mensaje: "El código de verificación ha expirado" });
        }

        // Actualizar usuario como verificado
        usuario.verificado = true;
        usuario.codigoVerificacion = null;
        usuario.codigoVerificacionExpira = null;
        await usuario.save();

        res.json({
            mensaje: "Correo verificado correctamente. Ya puedes iniciar sesión.",
            usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email }
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// REENVIAR CÓDIGO
export const reenviarCodigo = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ mensaje: "El email es requerido" });
        }

        const usuario = await usuarioModel
            .findOne({ email })
            .select('+codigoVerificacion +codigoVerificacionExpira');

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        if (usuario.verificado) {
            return res.status(400).json({ mensaje: "El usuario ya está verificado" });
        }

        // Generar nuevo código
        const codigo = generarCodigo();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 15 * 60000); // 15 minutos

        usuario.codigoVerificacion = codigo;
        usuario.codigoVerificacionExpira = expiracion;
        await usuario.save();

        // Enviar email con nuevo código
        try {
            await enviarCodigoVerificacion(email, usuario.nombre, codigo);
        } catch (emailError) {
            console.error('Error enviando email:', emailError);
            return res.status(500).json({ mensaje: "Error al enviar el código. Por favor intenta más tarde." });
        }

        res.json({ mensaje: "Código de verificación reenviado a tu correo" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// SOLICITAR RECUPERACIÓN DE CONTRASEÑA (envía código OTP)
export const solicitarRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ mensaje: "El email es requerido" });
        }

        const usuario = await usuarioModel.findOne({ email }).select('+resetCodigo +resetCodigoExpira +nombre');
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Generar código y expiración (60 minutos)
        const codigo = generarCodigo();
        const ahora = new Date();
        const expiracion = new Date(ahora.getTime() + 60 * 60000); // 60 minutos

        usuario.resetCodigo = codigo;
        usuario.resetCodigoExpira = expiracion;
        await usuario.save();

        try {
            await enviarCodigoRecuperacion(email, usuario.nombre || 'Usuario', codigo);
        } catch (emailError) {
            console.error('Error enviando email de recuperación:', emailError);
            return res.status(500).json({ mensaje: "Error al enviar el email de recuperación. Intenta más tarde." });
        }

        res.json({ mensaje: "Se ha enviado un código de recuperación a tu correo" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// RESETEAR CONTRASEÑA usando código OTP
export const resetearContrasena = async (req, res) => {
    try {
        const { email, codigo, nuevaContrasena } = req.body;

        if (!email || !codigo || !nuevaContrasena) {
            return res.status(400).json({ mensaje: "Email, código y nueva contraseña son requeridos" });
        }

        const usuario = await usuarioModel.findOne({ email }).select('+resetCodigo +resetCodigoExpira +contrasena');
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Validar código
        if (!usuario.resetCodigo || usuario.resetCodigo !== codigo) {
            return res.status(400).json({ mensaje: "Código de recuperación inválido" });
        }

        // Validar expiración
        const ahora = new Date();
        if (!usuario.resetCodigoExpira || ahora > usuario.resetCodigoExpira) {
            return res.status(400).json({ mensaje: "El código de recuperación ha expirado" });
        }

        // Asignar nueva contraseña y limpiar campos
        usuario.contrasena = nuevaContrasena;
        usuario.resetCodigo = null;
        usuario.resetCodigoExpira = null;
        await usuario.save();

        res.json({ mensaje: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};

// ACTUALIZAR SUSCRIPCIÓN A PREMIUM
export const actualizarSuscripcion = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { suscripcion } = req.body;

        if (!['free', 'premium'].includes(suscripcion)) {
            return res.status(400).json({ mensaje: "Suscripción inválida" });
        }

        const usuario = await usuarioModel.findByIdAndUpdate(
            usuarioId,
            { suscripcion },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Suscripción actualizada", usuario });
    } catch (error) {
        res.status(500).json({ mensaje: "Error", error: error.message });
    }
};