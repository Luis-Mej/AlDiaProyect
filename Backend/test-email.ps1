# Script de prueba para verificar la configuración de email y verificación
# Para Windows (PowerShell)

Write-Host "🧪 Prueba de Verificación de Email" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Leer .env
$envFile = ".env"
$env_vars = @{}

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $env_vars[$key] = $value
        }
    }
} else {
    Write-Host "❌ ERROR: Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar configuraciones
Write-Host "📋 Verificando Configuraciones:" -ForegroundColor Yellow
Write-Host ""

if ($env_vars["MONGO_URI"]) {
    Write-Host "✅ MONGO_URI configurado" -ForegroundColor Green
} else {
    Write-Host "❌ MONGO_URI no está configurado" -ForegroundColor Red
    exit 1
}

if ($env_vars["JWT_SECRET"]) {
    Write-Host "✅ JWT_SECRET configurado" -ForegroundColor Green
} else {
    Write-Host "❌ JWT_SECRET no está configurado" -ForegroundColor Red
    exit 1
}

if ($env_vars["EMAIL_USER"] -and $env_vars["EMAIL_USER"] -ne "tu-email@gmail.com") {
    Write-Host "✅ EMAIL_USER configurado: $($env_vars['EMAIL_USER'])" -ForegroundColor Green
} else {
    Write-Host "⚠️  EMAIL_USER no configurado o con valor por defecto" -ForegroundColor Yellow
    Write-Host "   Modo DESARROLLO: Los códigos se mostrarán en consola" -ForegroundColor Yellow
}

if ($env_vars["EMAIL_PASSWORD"] -and $env_vars["EMAIL_PASSWORD"] -ne "tu-contraseña-app-google") {
    Write-Host "✅ EMAIL_PASSWORD configurado (oculto por seguridad)" -ForegroundColor Green
} else {
    Write-Host "⚠️  EMAIL_PASSWORD no configurado" -ForegroundColor Yellow
    Write-Host "   Modo DESARROLLO: Los códigos se mostrarán en consola" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Flujo de Prueba:" -ForegroundColor Cyan
Write-Host "   1. Registra un usuario en http://localhost:5173/registrar" -ForegroundColor Gray
Write-Host "   2. Se generará un código de 6 dígitos" -ForegroundColor Gray
Write-Host "   3. En DESARROLLO, verás el código en esta consola (terminal)" -ForegroundColor Gray
Write-Host "   4. En PRODUCCIÓN, recibirás el código en tu email" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Cyan
Write-Host ""

npm run dev
