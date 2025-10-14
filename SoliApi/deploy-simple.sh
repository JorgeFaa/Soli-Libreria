#!/bin/bash

echo "🚀 Desplegando API Soli a Google Cloud Run..."
echo "Proyecto: soliproyect"
echo "Región: northamerica-south1"
echo "Servicio: soliapi (existente)"
echo ""

# Desplegar al servicio existente
gcloud run deploy soliapi
  --source . \
  --platform managed \
  --region northamerica-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --timeout=300 \
  --quiet

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Despliegue exitoso!"
    echo ""
    echo "🌐 URL de tu API:"
    gcloud run services describe soliapi --region=northamerica-south1 --format="value(status.url)"
    echo ""
    echo "📖 Documentación Swagger:"
    API_URL=$(gcloud run services describe soliapi --region=northamerica-south1 --format="value(status.url)")
    echo "$API_URL/swagger-ui/index.html"
    echo ""
    echo "🔍 Para ver logs en tiempo real:"
    echo "gcloud logging tail \"resource.type=cloud_run_revision AND resource.labels.service_name=soliapi\" --format=\"value(timestamp, textPayload)\""
else
    echo "❌ Error en el despliegue"
    exit 1
fi