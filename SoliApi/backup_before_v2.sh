#!/bin/bash

# =====================================================
# SCRIPT DE RESPALDO ANTES DE MIGRACIÓN V2
# =====================================================

echo "🔄 Iniciando respaldo de base de datos..."

# Variables (debes completarlas con tus datos)
DB_NAME="Soli_DB"     # Reemplaza con el nombre de tu base de datos
DB_USER="Soli_DB_Admin"        # Reemplaza con tu usuario
DB_HOST="34.51.52.73"         # Cambia si tu BD no está en localhost
DB_PORT="5432"             # Puerto de PostgreSQL

# Crear directorio de respaldos si no existe
mkdir -p backups

# Generar nombre de archivo con timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/backup_before_v2_${TIMESTAMP}.sql"

echo "📁 Creando respaldo en: $BACKUP_FILE"

# Crear respaldo completo
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    --clean --create --if-exists \
    --verbose \
    -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Respaldo creado exitosamente: $BACKUP_FILE"
    echo "📊 Tamaño del respaldo: $(du -sh $BACKUP_FILE | cut -f1)"
    echo ""
    echo "🔧 Para restaurar en caso de problemas:"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -f $BACKUP_FILE"
    echo ""
    echo "🚀 Ahora puedes proceder con la migración V2"
else
    echo "❌ Error al crear el respaldo"
    echo "   Verifica la conexión a la base de datos"
    exit 1
fi