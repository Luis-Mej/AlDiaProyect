import OpenAI from "openai";

let client = null;

// 🔥 Inicializar cliente SOLO cuando se necesite
const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[IA] OPENAI_API_KEY no configurada");
    return null;
  }

  if (!client) {
    console.log("[IA] Inicializando cliente OpenAI...");
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return client;
};

const construirPromptFinanciero = (datos) => {
  return `
Actúa como un asesor financiero experto en servicios del hogar (luz, agua, etc).

Datos del usuario:
${JSON.stringify(datos, null, 2)}

Tareas:
1. Analiza los gastos.
2. Detecta aumentos o irregularidades.
3. Predice tendencia del próximo mes.
4. Da consejos prácticos para ahorrar.

Responde en español claro, máximo 6 líneas.
`;
};

export const analizarFinanzasConIA = async (datos) => {
  try {
    // Validar datos de entrada
    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      return "Error: No se proporcionaron datos válidos para el análisis.";
    }

    const aiClient = getClient();

    if (!aiClient) {
      return "Simulación de análisis: No se encontró OPENAI_API_KEY en el servidor. Por favor, configure la clave para habilitar el análisis real.";
    }

    const prompt = construirPromptFinanciero(datos);

    const response = await aiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 200
    });

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.error("Error IA:", error);
    return `No se pudo generar análisis inteligente. Detalles: ${error.message}`;
  }
};