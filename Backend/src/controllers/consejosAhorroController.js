// src/controllers/consejosAhorroController.js

import recordatorioModel from '../models/recordatorioModel.js';
import serviciosUsuarioModel from '../models/serviciosUsuarioModel.js';
import logger from '../utils/logger.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generar consejos de ahorro basados en patrones de consumo y IA
 * POST /consejos-ahorro/generar
 */
export const generarConsejosAhorro = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { recordatorioId } = req.body;

    // Obtener el recordatorio
    let recordatorio = recordatorioId
      ? await recordatorioModel.findOne({ _id: recordatorioId, usuarioId })
      : null;

    if (recordatorioId && !recordatorio) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' });
    }

    // Obtener todos los servicios del usuario
    const serviciosUsuario = await serviciosUsuarioModel
      .find({ usuarioId })
      .populate('servicioId')
      .sort({ createdAt: -1 })
      .limit(12);

    // Obtener recordatorios activos para análisis
    const recordatorios = await recordatorioModel
      .find({ usuarioId, estado: 'activo' })
      .sort({ fechaPago: 1 });

    // Construir datos para análisis
    const datosAnalisis = {
      totalServicios: serviciosUsuario.length,
      totalRecordatorios: recordatorios.length,
      servicios: serviciosUsuario.map((su) => ({
        servicio: su.servicioId?.nombre || su.servicio,
        monto: su.montoEstimado || recordatorios
          .filter((r) => r.servicio === su.servicio)
          .reduce((sum, r) => sum + (r.monto || 0), 0) / Math.max(recordatorios.filter((r) => r.servicio === su.servicio).length, 1),
        estado: su.estado,
      })),
      recordatoriosDePrueba: recordatorios.map((r) => ({
        servicio: r.servicio,
        monto: r.monto,
        fechaPago: r.fechaPago,
        estado: r.estado,
      })),
    };

    // Generar consejos con IA
    const consejos = await generarConsejosConIA(datosAnalisis, recordatorio);

    // Guardar consejos en el recordatorio si se proporcionó
    if (recordatorio && consejos.length > 0) {
      recordatorio.consejosAhorro = consejos.map((consejo) => ({
        titulo: consejo.titulo,
        descripcion: consejo.descripcion,
        ahorroPotencial: consejo.ahorroPotencial,
        generadoEn: new Date(),
      }));
      await recordatorio.save();
    }

    res.json({
      ok: true,
      data: {
        recordatorioId: recordatorio?._id,
        consejos,
        datosAnalizados: datosAnalisis,
      },
    });
  } catch (error) {
    logger.error('Error en generarConsejosAhorro:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener consejos de ahorro para un recordatorio específico
 * GET /consejos-ahorro/:recordatorioId
 */
export const obtenerConsejosAhorro = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    const { recordatorioId } = req.params;

    const recordatorio = await recordatorioModel.findOne({
      _id: recordatorioId,
      usuarioId,
    });

    if (!recordatorio) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' });
    }

    res.json({
      ok: true,
      data: {
        recordatorioId: recordatorio._id,
        servicio: recordatorio.servicio,
        monto: recordatorio.monto,
        consejos: recordatorio.consejosAhorro || [],
      },
    });
  } catch (error) {
    logger.error('Error en obtenerConsejosAhorro:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener análisis completo de gastos y recomendaciones
 * GET /consejos-ahorro/analisis/completo
 */
export const obtenerAnalisisCompleto = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || req.usuario?.sub || req.usuario?._id;
    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Recordatorios del último mes
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const recordatorios = await recordatorioModel.find({
      usuarioId,
      fechaPago: { $gte: hace30Dias },
    });

    // Cálculos
    const gastoTotal = recordatorios.reduce((sum, r) => sum + (r.monto || 0), 0);
    const gastoPromedio = recordatorios.length > 0 ? gastoTotal / recordatorios.length : 0;
    const serviciosPorTipo = {};

    recordatorios.forEach((r) => {
      if (!serviciosPorTipo[r.servicio]) {
        serviciosPorTipo[r.servicio] = { count: 0, total: 0 };
      }
      serviciosPorTipo[r.servicio].count++;
      serviciosPorTipo[r.servicio].total += r.monto || 0;
    });

    const analisisDetallado = Object.entries(serviciosPorTipo).map(
      ([servicio, datos]) => ({
        servicio,
        cantidad: datos.count,
        gastoTotal: datos.total,
        gastoPorPago: datos.total / datos.count,
      })
    );

    // Generar recomendaciones
    const recomendaciones = generarRecomendaciones(
      gastoTotal,
      analisisDetallado,
      recordatorios
    );

    res.json({
      ok: true,
      data: {
        periodo: { inicio: hace30Dias, fin: new Date() },
        resumen: {
          gastoTotal,
          gastoPromedio,
          totalRecordatorios: recordatorios.length,
          recordatoriosCompletados: recordatorios.filter(
            (r) => r.estado === 'completado'
          ).length,
        },
        analisisPorServicio: analisisDetallado,
        recomendaciones,
      },
    });
  } catch (error) {
    logger.error('Error en obtenerAnalisisCompleto:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Llamar a la IA de Gemini para generar consejos personalizados
 */
async function generarConsejosConIA(datos, recordatorio) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY no configurada, usando consejos locales');
      return generarConsejosLocales(datos, recordatorio);
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'Eres un asesor financiero especializado en ahorro de servicios básicos. Proporciona consejos prácticos y específicos en formato JSON con la siguiente estructura: [{"titulo":"...", "descripcion":"...", "ahorroPotencial":"..."}]. Sé conciso pero informativo.'
    });

    // Construir prompt
    const prompt = construirPrompt(datos, recordatorio);

    // Generar respuesta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parsear respuesta de Gemini
    const consejos = parsearRespuestaGemini(text);

    if (consejos.length === 0) {
      logger.warn('Gemini no generó consejos válidos, usando locales');
      return generarConsejosLocales(datos, recordatorio);
    }

    return consejos;
  } catch (error) {
    logger.error('Error al llamar a Gemini API:', error);
    return generarConsejosLocales(datos, recordatorio);
  }
}

/**
 * Parsear respuesta de Gemini y extraer consejos
 */
function parsearRespuestaGemini(text) {
  try {
    // Intentar parsear directamente como JSON
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Si no es JSON directo, buscar JSON en el texto
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e2) {
        logger.warn('Error parseando JSON extraído:', e2);
      }
    }

    // Fallback: extraer consejos manualmente del texto
    return extraerConsejosDelTexto(text);
  }

  return [];
}

/**
 * Extraer consejos del texto cuando no hay JSON válido
 */
function extraerConsejosDelTexto(text) {
  const consejos = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('💡') || line.includes('💧') || line.includes('📊') || line.includes('📅')) {
      const titulo = line;
      const descripcion = lines[i + 1] || '';
      const ahorro = lines[i + 2] || 'Variable';

      consejos.push({
        titulo: titulo.replace(/^[•\-*]\s*/, ''),
        descripcion: descripcion.replace(/^[•\-*]\s*/, ''),
        ahorroPotencial: ahorro.includes('$') ? ahorro : 'Variable'
      });
    }
  }

  return consejos.length > 0 ? consejos : [];
}
function generarConsejosLocales(datos, recordatorio) {
  const consejos = [];

  if (recordatorio?.servicio === 'cnel') {
    consejos.push({
      titulo: '💡 Optimiza consumo de electricidad',
      descripcion:
        'Usar LED, desconectar equipos en standby y ajustar aire acondicionado puede reducir tu consumo de 15-20%.',
      ahorroPotencial: recordatorio.monto ? `$${(recordatorio.monto * 0.15).toFixed(2)}` : 'Sin determinar',
    });
  }

  if (recordatorio?.servicio === 'interagua') {
    consejos.push({
      titulo: '💧 Reduce consumo de agua',
      descripcion:
        'Reparar fugas, tomar duchas cortas y usar inodoros eficientes puede ahorrar 30% en agua.',
      ahorroPotencial: recordatorio.monto ? `$${(recordatorio.monto * 0.30).toFixed(2)}` : 'Sin determinar',
    });
  }

  if (datos.totalRecordatorios > 5) {
    consejos.push({
      titulo: '📊 Consolidar servicios',
      descripcion:
        'Considera consolidar múltiples servicios con el mismo proveedor para obtener descuentos.',
      ahorroPotencial: 'Variable según proveedor',
    });
  }

  consejos.push({
    titulo: '📅 Planifica tus pagos',
    descripcion:
      'Usa el calendario para evitar pagos atrasados y acciones legales que generan costos adicionales.',
    ahorroPotencial: 'Previene penalizaciones',
  });

  return consejos;
}

/**
 * Construir prompt para la IA
 */
function construirPrompt(datos, recordatorio) {
  let prompt = `Analiza estos datos de consumo y gastos del usuario y genera consejos de ahorro personalizados:\n\n`;

  prompt += `DATOS DEL USUARIO:\n`;
  prompt += `- Total de servicios registrados: ${datos.totalServicios}\n`;
  prompt += `- Total de recordatorios activos: ${datos.totalRecordatorios}\n`;
  prompt += `- Gasto total estimado: $${datos.servicios.reduce((sum, s) => sum + (s.monto || 0), 0).toFixed(2)}\n\n`;

  prompt += `SERVICIOS DETALLADOS:\n`;
  datos.servicios.forEach((s, index) => {
    prompt += `${index + 1}. ${s.servicio}: $${s.monto || 0} mensuales (Estado: ${s.estado})\n`;
  });

  if (recordatorio) {
    prompt += `\nRECORDATORIO ESPECÍFICO:\n`;
    prompt += `- Servicio: ${recordatorio.servicio}\n`;
    prompt += `- Monto: $${recordatorio.monto || 'No especificado'}\n`;
    prompt += `- Fecha de pago: ${recordatorio.fechaPago}\n`;
  }

  prompt += `\nINSTRUCCIONES:\n`;
  prompt += `1. Genera exactamente 3-4 consejos prácticos y específicos para ahorrar en estos servicios.\n`;
  prompt += `2. Cada consejo debe incluir: título atractivo, descripción detallada y ahorro potencial estimado.\n`;
  prompt += `3. Usa emojis relevantes en los títulos (💡, 💧, 📊, 📅, etc.).\n`;
  prompt += `4. Sé realista y específico basado en los datos proporcionados.\n`;
  prompt += `5. Responde ÚNICAMENTE con un array JSON válido, sin texto adicional.\n\n`;

  prompt += `FORMATO REQUERIDO (JSON array):\n`;
  prompt += `[{"titulo": "💡 Título del consejo", "descripcion": "Descripción detallada del consejo", "ahorroPotencial": "$50-100 mensuales"}]`;

  return prompt;
}

/**
 * Generar recomendaciones basadas en análisis
 */
function generarRecomendaciones(gastoTotal, analisisDetallado, recordatorios) {
  const recomendaciones = [];

  // Analizar por servicio
  analisisDetallado.forEach(({ servicio, gastoTotal: gastoServicio, gastoPorPago }) => {
    if (servicio.toLowerCase().includes('cnel') && gastoPorPago > 50) {
      recomendaciones.push({
        prioridad: 'alta',
        tipo: 'ahorro-electricidad',
        mensaje: `Tu consumo de electricidad (${gastoPorPago.toFixed(2)}/mes) es elevado. Considera revisar electrodomésticos antiguos.`,
        ahorroPotencial: gastoPorPago * 0.15,
      });
    }

    if (servicio.toLowerCase().includes('agua') && gastoPorPago > 30) {
      recomendaciones.push({
        prioridad: 'alta',
        tipo: 'ahorro-agua',
        mensaje: `Tu consumo de agua (${gastoPorPago.toFixed(2)}/mes) está elevado. Verifica fugas y hábitos de uso.`,
        ahorroPotencial: gastoPorPago * 0.25,
      });
    }
  });

  // Recomendaciones generales
  if (recordatorios.filter((r) => r.estado === 'vencido').length > 0) {
    recomendaciones.push({
      prioridad: 'crítica',
      tipo: 'pagos-vencidos',
      mensaje: 'Tienes pagos vencidos que generan intereses. Prioriza liquidarlos.',
      ahorroPotencial: gastoTotal * 0.05,
    });
  }

  return recomendaciones;
}
