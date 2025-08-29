# Setup script for DevTools Application (Windows PowerShell)

Write-Host "🚀 Configurando DevTools Application..." -ForegroundColor Green

# Crear directorios necesarios
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
    Write-Host "📁 Directorio logs creado" -ForegroundColor Blue
}

if (!(Test-Path "data")) {
    New-Item -ItemType Directory -Path "data"
    Write-Host "📁 Directorio data creado" -ForegroundColor Blue
}

# Copiar archivo de configuración si no existe
if (!(Test-Path ".env")) {
    Write-Host "📝 Copiando archivo de configuración..." -ForegroundColor Blue
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado. Revisa y ajusta las configuraciones según tu entorno." -ForegroundColor Green
} else {
    Write-Host "⚠️  El archivo .env ya existe. No se sobrescribirá." -ForegroundColor Yellow
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
npm install

# Compilar la aplicación
Write-Host "🔨 Compilando aplicación..." -ForegroundColor Blue
npm run build

Write-Host "✅ DevTools Application configurada correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisa el archivo .env y ajusta las configuraciones"
Write-Host "2. Para desarrollo: npm run dev"
Write-Host "3. Para producción: npm start"
Write-Host "4. Dashboard disponible en: http://localhost:3001/public"
Write-Host ""
Write-Host "📚 Ver README.md para más información" -ForegroundColor Cyan
