// src/controllers/asistenteController.js

import ServiciosUsuario from "../models/serviciosUsuarioModel.js";
import { consultarCNEL } from "../integrations/cnelScraper.js";
import { consultarInteragua } from "../integrations/interaguaScraper.js";
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

// Helper para convertir el primer carácter a mayúscula
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Función que encapsula la lógica de llamada a la IA de Gemini.
 * @param {string} prompt El prompt que incluye la comparación de datos.
 * @returns {Promise<string>} La respuesta generada por la IA.
 */
async function generarAnalisisIA(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY no configurada');
      return 'Lo siento, el servicio de análisis inteligente no está disponible en este momento. Por favor, contacta al soporte técnico.';
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'Actúa como un analista financiero personal y amable. Analiza los datos de consumo de servicios básicos (luz, agua) del usuario, detecta variaciones significativas entre el mes pasado y el mes actual, y proporciona un análisis conciso de no más de 3 párrafos y un consejo práctico para ahorrar energía o agua. Usa un tono motivador y profesional.'
    });

    // Generar respuesta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || 'No se pudo generar el análisis en este momento.';
  } catch (error) {
    logger.error('Error al llamar a Gemini API en asistente:', error);
    return 'Lo siento, ocurrió un error al generar el análisis. Por favor, intenta más tarde.';
  }
}


/**
 * POST /api/asistente/analizar
 * Analiza el estado actual de los servicios del usuario comparándolo con el mes anterior.
 */
export const analizarServiciosController = async (req, res) => {
    try {
        const usuarioId = req.usuario?.id;
        if (!usuarioId) return res.status(401).json({ ok: false, error: "Usuario no autenticado" });

        // 1. Obtener todos los servicios del usuario
        const servicios = await ServiciosUsuario.find({ usuarioId: usuarioId }).lean();

        if (!servicios || servicios.length === 0) {
            return res.status(200).json({ 
                ok: true, 
                analisis: "No tienes servicios guardados para analizar.", 
                detalles: []
            });
        }
        
        const headless = req.query.debug === "true" ? false : true;
        const detalles = [];
        let promptGeneral = "Analiza y compara los siguientes datos de servicios básicos del usuario. Identifica aumentos o disminuciones de gastos significativos (Deuda/Saldo). \n\n";

        // 2. Ejecutar Scrapers en SERIE y construir el prompt
        for (let i = 0; i < servicios.length; i++) {
            const s = servicios[i];
            const servicioNombre = capitalize(s.servicio);
            let resultadoActual;
            
            // a. Ejecutar Scraper
            if (s.servicio === "cnel") {
                resultadoActual = await consultarCNEL(s.cuenta, { headless, screenshotOnError: false });
            } else if (s.servicio === "interagua") {
                resultadoActual = await consultarInteragua(s.cuenta, { headless, screenshotOnError: false });
            } else {
                continue; // Saltar servicios no soportados
            }
            
            // b. Procesar el resultado del Scraper
            if (!resultadoActual.ok) {
                console.warn(`Error consultando ${servicioNombre} para ${s.cuenta}: ${resultadoActual.error}`);
                detalles.push({ servicio: servicioNombre, ok: false, mensaje: "Error al consultar la fuente oficial." });
                continue;
            }

            // c. Preparar datos para comparación y actualización
            const saldoActual = (s.servicio === "cnel" ? resultadoActual.deuda : resultadoActual.saldoActual) || 0;
            const saldoPasado = s.ultimoResultado 
                ? (s.servicio === "cnel" ? s.ultimoResultado.deuda : s.ultimoResultado.saldoActual) || 0 
                : null;
            
            const resultadoAAnalizar = {
                servicio: servicioNombre,
                cuenta: s.cuenta,
                saldoActual: saldoActual,
                saldoPasado: saldoPasado,
                variacion: saldoPasado !== null ? saldoActual - saldoPasado : null,
                fechaVencimiento: resultadoActual.fechaVencimiento,
            };
            
            detalles.push(resultadoAAnalizar);

            // d. Construir el Prompt
            promptGeneral += `--- Servicio: ${servicioNombre} (Cuenta: ${s.cuenta}) ---\n`;
            promptGeneral += `Deuda/Saldo Actual: $${saldoActual.toFixed(2)}\n`;
            
            if (saldoPasado !== null) {
                const variacionTexto = resultadoAAnalizar.variacion > 0 
                    ? `Aumento de $${Math.abs(resultadoAAnalizar.variacion).toFixed(2)}` 
                    : resultadoAAnalizar.variacion < 0 
                    ? `Disminución de $${Math.abs(resultadoAAnalizar.variacion).toFixed(2)}` 
                    : "Sin variación.";
                
                promptGeneral += `Deuda/Saldo del Mes Pasado (Referencia): $${saldoPasado.toFixed(2)}\n`;
                promptGeneral += `Variación con respecto al mes anterior: ${variacionTexto}\n`;
            } else {
                promptGeneral += "No hay datos de referencia del mes pasado.\n";
            }
            promptGeneral += "\n";

            // e. Actualizar el resultado en la BD para el próximo mes (solo si la consulta fue exitosa)
            await ServiciosUsuario.findByIdAndUpdate(s._id, {
                ultimoResultado: {
                    servicio: s.servicio,
                    saldoActual: saldoActual,
                    deuda: resultadoActual.deuda, // Para CNEL
                    fechaConsulta: new Date(),
                    raw: undefined // Evitar guardar data cruda innecesariamente grande
                }
            });
        }

        // 3. Llamar a la IA con el prompt construido
        let analisisIA;
        try {
            analisisIA = await generarAnalisisIA(promptGeneral);
        } catch(aiError) {
             console.error("Error al obtener análisis de la IA:", aiError.message);
             // Devolver los datos consultados pero con un mensaje de error de la IA
             return res.status(500).json({ 
                ok: false, 
                error: "Error del servidor al contactar al asistente IA. La data consultada es la siguiente:",
                detalles: detalles 
            });
        }
        
        // 4. Devolver la respuesta final
        res.status(200).json({ 
            ok: true, 
            analisis: analisisIA, // La respuesta de la IA
            detalles: detalles // Los datos comparativos usados por la IA
        });

    } catch (error) {
        console.error("Error en analizarServiciosController:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor: " + error.message });
    }
};