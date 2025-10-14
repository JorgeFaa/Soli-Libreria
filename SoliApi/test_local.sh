#!/bin/bash

# =====================================================
# SCRIPT PARA PROBAR LA API LOCALMENTE
# =====================================================

echo "🧪 Probando API Soli V1 & V2 localmente..."

# Verificar si existe archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró archivo .env"
    echo "   Copia .env.template como .env y completa las variables"
    echo ""
    echo "   cp .env.template .env"
    echo "   nano .env"
    echo ""
    exit 1
fi

echo "✅ Archivo .env encontrado"

# Verificar variables críticas
echo "🔍 Verificando variables de entorno críticas..."

source .env

required_vars=(
    "DB_URL"
    "DB_USER"
    "DB_PASSWORD"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Variables faltantes en .env:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "   Edita .env y completa estas variables"
    exit 1
fi

echo "✅ Variables críticas configuradas"

# Compilar la aplicación
echo "🔧 Compilando aplicación..."
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación"
    exit 1
fi

echo "✅ Compilación exitosa"

# Ejecutar aplicación con perfil de producción
echo "🚀 Ejecutando aplicación con perfil prod..."
echo "   Presiona Ctrl+C para detener"
echo "   URL: http://localhost:8080"
echo "   Health: http://localhost:8080/actuator/health"
echo ""

export SPRING_PROFILES_ACTIVE=prod
java -jar target/*.jar