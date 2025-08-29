#!/bin/bash

# Setup script for DevTools Application

echo "🚀 Configurando DevTools Application..."

# Crear directorios necesarios
mkdir -p logs
mkdir -p data

# Copiar archivo de configuración si no existe
if [ ! -f .env ]; then
    echo "📝 Copiando archivo de configuración..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Revisa y ajusta las configuraciones según tu entorno."
else
    echo "⚠️  El archivo .env ya existe. No se sobrescribirá."
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Compilar la aplicación
echo "🔨 Compilando aplicación..."
npm run build

echo "✅ DevTools Application configurada correctamente!"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Revisa el archivo .env y ajusta las configuraciones"
echo "2. Para desarrollo: npm run dev"
echo "3. Para producción: npm start"
echo "4. Dashboard disponible en: http://localhost:3001/public"
echo ""
echo "📚 Ver README.md para más información"
