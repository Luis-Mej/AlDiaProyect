// check-api-key.js - Verificar si la API key de Gemini es válida
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function checkApiKey() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY no está configurada');
      return;
    }

    console.log('🔍 Verificando API key...');
    console.log(`API Key: ${apiKey.substring(0, 20)}...`);

    // Hacer una petición simple para verificar la API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key válida!');
      console.log(`📊 Modelos disponibles: ${data.models?.length || 0}`);

      // Mostrar primeros 5 modelos
      if (data.models) {
        console.log('\n📋 Primeros modelos:');
        data.models.slice(0, 5).forEach(model => {
          console.log(`  - ${model.name}`);
        });
      }
    } else {
      const error = await response.text();
      console.error('❌ API key inválida o error:');
      console.error(`Status: ${response.status}`);
      console.error(`Error: ${error}`);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar verificación
checkApiKey();