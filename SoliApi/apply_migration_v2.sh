#!/bin/bash

# =====================================================
# SCRIPT DE APLICACIÓN DE MIGRACIÓN V2
# =====================================================

echo "🚀 Aplicando migración V2 a la base de datos..."

# Variables (debes completarlas con tus datos)
DB_NAME="Soli_DB"     # Reemplaza con el nombre de tu base de datos
DB_USER="Soli_DB_Admin"        # Reemplaza con tu usuario
DB_HOST="34.51.52.73"         # Cambia si tu BD no está en localhost
DB_PORT="5432"            # Puerto de PostgreSQL

MIGRATION_FILE="src/main/resources/migration_v2.sql"

echo "🔍 Verificando archivos necesarios..."

# Verificar que existe el archivo de migración
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: No se encontró $MIGRATION_FILE"
    exit 1
fi

echo "✅ Archivo de migración encontrado"

# Verificar conexión a la base de datos
echo "🔌 Verificando conexión a la base de datos..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Error: No se puede conectar a la base de datos"
    echo "   Verifica los datos de conexión:"
    echo "   Host: $DB_HOST"
    echo "   Puerto: $DB_PORT"  
    echo "   Usuario: $DB_USER"
    echo "   Base de datos: $DB_NAME"
    exit 1
fi

echo "✅ Conexión exitosa"

# Mostrar información del script de migración
echo ""
echo "📋 Información de la migración:"
echo "   Archivo: $MIGRATION_FILE"
echo "   Tamaño: $(du -sh $MIGRATION_FILE | cut -f1)"
echo "   Líneas: $(wc -l < $MIGRATION_FILE)"
echo ""

# Preguntar confirmación
echo "⚠️  Esta migración:"
echo "   ✅ Agrega campos de auditoría (created_at, updated_at)"
echo "   ✅ Crea índices optimizados para API V2"
echo "   ✅ Instala extensiones pg_trgm y unaccent"
echo "   ✅ Configura triggers automáticos"
echo "   ✅ Es SEGURA para re-ejecutar"
echo "   ✅ NO afecta datos existentes"
echo ""
echo "🤔 ¿Continuar con la migración? (y/N): "
read -r CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "🚫 Migración cancelada por el usuario"
    exit 0
fi

# Aplicar migración
echo ""
echo "🔧 Aplicando migración..."
echo "============================================"

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE

if [ $? -eq 0 ]; then
    echo "============================================"
    echo "🎉 ¡MIGRACIÓN V2 COMPLETADA EXITOSAMENTE!"
    echo ""
    echo "📊 Cambios aplicados:"
    echo "   • Campos de auditoría agregados"
    echo "   • $(grep -c "CREATE INDEX" $MIGRATION_FILE) índices creados"
    echo "   • Extensiones pg_trgm y unaccent instaladas"
    echo "   • Triggers de timestamps configurados"
    echo ""
    echo "🚀 Tu base de datos está optimizada para API V2"
    echo "📚 Consulta DATABASE_README.md para más detalles"
else
    echo "============================================"
    echo "❌ Error durante la migración"
    echo ""
    echo "🔧 Para revisar el error:"
    echo "   1. Revisa los mensajes anteriores"
    echo "   2. Verifica permisos de usuario en PostgreSQL"
    echo "   3. Asegúrate que pg_trgm esté disponible"
    echo ""
    echo "🆘 Para restaurar el respaldo:"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -f backups/backup_before_v2_*.sql"
    exit 1
fi