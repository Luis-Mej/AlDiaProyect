// list-models.js - Script para listar modelos disponibles de Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY no está configurada');
      return;
    }

    console.log('🔍 Listando modelos disponibles...');

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    // Listar modelos disponibles
    const models = await genAI.listModels();
    console.log('📋 Modelos disponibles:');
    console.log('====================');

    models.forEach(model => {
      console.log(`📌 ${model.name}`);
      console.log(`   Descripción: ${model.description}`);
      console.log(`   Métodos: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error al listar modelos:', error.message);
  }
}

// Ejecutar
listModels();