# Configuración de Gemini AI API

## 🚀 Configuración Inicial

### 1. Obtener API Key
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Copia la key generada

### 2. Configurar Variables de Entorno
Edita el archivo `.env` en la carpeta `Backend/` y agrega:

```env
# Gemini AI API Key
GEMINI_API_KEY=tu_api_key_aqui
```

### 3. Probar la Conexión
Ejecuta el script de prueba:

```bash
cd Backend
node test-gemini.js
```

Deberías ver una respuesta exitosa de Gemini.

## 🤖 Funcionalidades con Gemini

### Asistente IA (Premium)
- **Endpoint**: `POST /api/asistente/analizar`
- **Descripción**: Analiza servicios del usuario y compara con el mes anterior
- **Requiere**: Suscripción Premium

### Consejos de Ahorro
- **Endpoint**: `POST /api/consejos-ahorro/generar`
- **Descripción**: Genera consejos personalizados basados en datos del usuario
- **Requiere**: Autenticación (funciona en free y premium)

### Análisis Completo (Premium)
- **Endpoint**: `GET /api/consejos-ahorro/analisis/completo`
- **Descripción**: Análisis detallado de gastos del último mes
- **Requiere**: Suscripción Premium

## 📋 Formato de Respuestas

Gemini está configurado para devolver respuestas en formato JSON estructurado:

```json
[
  {
    "titulo": "💡 Título del consejo",
    "descripcion": "Descripción detallada del consejo",
    "ahorroPotencial": "$50-100 mensuales"
  }
]
```

## 🔧 Solución de Problemas

### Error: "GEMINI_API_KEY no configurada"
- Verifica que la variable esté en `.env`
- Asegúrate de que no haya espacios extra

### Error: "API_KEY_INVALID"
- Verifica que la API key sea correcta
- Revisa que tengas permisos en Google Cloud

### Error: "quota_exceeded"
- Has excedido el límite gratuito
- Actualiza a un plan pago en Google AI Studio

### Respuestas vacías o errores
- Gemini usa consejos locales como fallback
- Revisa los logs del servidor para más detalles

## 💰 Costos

- **Gratuito**: 60 consultas/minuto, 1000 consultas/día
- **Pago**: Según uso real (muy económico para uso normal)

## 🔒 Seguridad

- La API key está protegida en variables de entorno
- No se expone al frontend
- Solo se usa en el backend para generar respuestas