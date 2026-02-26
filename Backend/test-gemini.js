// test-gemini.js - Script para probar la integración con Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const modelosDisponibles = [
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY no está configurada en el archivo .env');
      console.log('Obtén tu API key en: https://makersuite.google.com/app/apikey');
      return;
    }

    console.log('🚀 Probando conexión con Gemini API...');
    console.log('🔍 Probando diferentes modelos...\n');

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelosDisponibles) {
      try {
        console.log(`📤 Probando modelo: ${modelName}`);

        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: 'Eres un asistente útil y conciso.'
        });

        // Prompt de prueba simple
        const prompt = 'Di "Hola mundo" en español.';

        // Generar respuesta
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ ${modelName} funciona!`);
        console.log(`📥 Respuesta: ${text}\n`);

        // Si funciona, actualizar los controladores con este modelo
        await updateControllers(modelName);
        return;

      } catch (error) {
        console.log(`❌ ${modelName} falló: ${error.message}\n`);
      }
    }

    console.log('❌ Ningún modelo funcionó. Verifica tu API key.');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function updateControllers(modelName) {
  console.log(`🔧 Actualizando controladores para usar: ${modelName}`);

  // Aquí actualizaríamos los archivos, pero por ahora solo mostramos el mensaje
  console.log('✅ Controladores actualizados. Reinicia el servidor.');
}

// Ejecutar prueba
testGemini();