#!/bin/bash
# Script de prueba para verificar la configuración de email y verificación

echo "🧪 Prueba de Verificación de Email"
echo "===================================="
echo ""

# Verificar que las variables de entorno existen
if [ -z "$MONGO_URI" ]; then
    echo "❌ ERROR: MONGO_URI no está configurado"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET no está configurado"
    exit 1
fi

echo "✅ MONGO_URI configurado"
echo "✅ JWT_SECRET configurado"
echo ""

# Verificar email config
if [ -z "$EMAIL_USER" ] || [ "$EMAIL_USER" = "tu-email@gmail.com" ]; then
    echo "⚠️  EMAIL_USER no configurado o con valor por defecto"
    echo "   Modo DESARROLLO: Los códigos se mostrarán en consola"
else
    echo "✅ EMAIL_USER configurado: $EMAIL_USER"
fi

if [ -z "$EMAIL_PASSWORD" ] || [ "$EMAIL_PASSWORD" = "tu-contraseña-app-google" ]; then
    echo "⚠️  EMAIL_PASSWORD no configurado"
    echo "   Modo DESARROLLO: Los códigos se mostrarán en consola"
else
    echo "✅ EMAIL_PASSWORD configurado (oculto por seguridad)"
fi

echo ""
echo "📝 Flujo de Prueba:"
echo "   1. Registra un usuario en http://localhost:5173/registrar"
echo "   2. Se generará un código de 6 dígitos"
echo "   3. En DESARROLLO, verás el código en esta consola (terminal)"
echo "   4. En PRODUCCIÓN, recibirás el código en tu email"
echo ""
echo "🚀 Iniciando servidor..."
echo ""

npm run dev
