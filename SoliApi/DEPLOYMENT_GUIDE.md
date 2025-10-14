# 🚀 Guía de Despliegue - API Soli V1 & V2

## 📋 **Resumen**

Esta guía te ayudará a desplegar tu API Spring Boot en diferentes plataformas de nube con soporte completo para V1 y V2.

---

## 🎯 **Opciones de Despliegue Recomendadas**

| Plataforma | Precio | Facilidad | PostgreSQL | Recomendación |
|------------|--------|-----------|------------|---------------|
| **Railway** | Gratis/$5+ | ⭐⭐⭐⭐⭐ | ✅ Incluido | 🏆 **RECOMENDADO** |
| **Render** | Gratis/$7+ | ⭐⭐⭐⭐ | ✅ Incluido | ✅ Muy buena opción |
| **Google Cloud Run** | Pay-per-use | ⭐⭐⭐ | ⚠️ Separado | ✅ Para escala |
| **AWS App Runner** | Pay-per-use | ⭐⭐ | ⚠️ RDS separado | ✅ Integración AWS |
| **Heroku** | $7+ | ⭐⭐⭐⭐ | ✅ Add-on | ⚠️ Más costoso |

---

## 🏆 **Opción 1: Railway (RECOMENDADA)**

### **¿Por qué Railway?**
- ✅ **Gratis**: 500 horas/mes + $5 crédito
- ✅ **PostgreSQL incluido** automáticamente
- ✅ **Variables de entorno** fáciles de configurar
- ✅ **Deploy automático** desde Git
- ✅ **Logs en tiempo real**

### **Pasos para Railway:**

#### 1. **Preparar el repositorio**
```bash
# Asegúrate de estar en la rama con todos los cambios
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

#### 2. **Crear cuenta y proyecto en Railway**
1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta GitHub
3. Clic en "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio SoliApi

#### 3. **Railway detectará automáticamente:**
- ✅ Dockerfile
- ✅ Configurará PostgreSQL
- ✅ Expondrá puerto 8080

#### 4. **Configurar variables de entorno**
En el dashboard de Railway, ve a Variables y agrega:

```bash
# Variables generadas automáticamente por Railway
DATABASE_URL=postgresql://...    # Auto-generada
DB_URL=postgresql://...         # Copia la DATABASE_URL aquí

# Variables que DEBES configurar manualmente
DB_USER=postgres                # Usuario por defecto de Railway
DB_PASSWORD=password_generado   # Visible en Railway
MY_AWS_ACCESS_KEY_ID=tu_access_key
MY_AWS_SECRET_ACCESS_KEY=tu_secret_key
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_lTSWlzRlA
COGNITO_CLIENT_ID=tu_client_id
COGNITO_CLIENT_SECRET=tu_client_secret
JWK_SET_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_lTSWlzRlA/.well-known/jwks.json
SPRING_PROFILES_ACTIVE=prod
PORT=8080
```

#### 5. **Aplicar migración de base de datos**
Una vez desplegado, accede a la base de datos:
```bash
# En Railway, ve a la base PostgreSQL → Connect → Copy connection string
psql "postgresql://postgres:password@host:port/railway" -f src/main/resources/migration_v2.sql
```

#### 6. **Verificar despliegue**
- URL estará disponible en Railway: `https://tu-app-production-xxxx.up.railway.app`
- Probar: `https://tu-app.railway.app/actuator/health`

---

## 🌟 **Opción 2: Render**

### **Pasos para Render:**

#### 1. **Crear cuenta en Render**
- Ve a [render.com](https://render.com)
- Conecta GitHub

#### 2. **Crear servicio web**
- "New" → "Web Service"
- Conecta tu repo
- Render detectará `render.yaml`

#### 3. **La base de datos se crea automáticamente**
- Render leerá la configuración de `render.yaml`
- PostgreSQL gratuito incluido

#### 4. **Configurar variables en el dashboard**
Todas las variables marcadas con `sync: false` en `render.yaml`

---

## ⚡ **Opción 3: Google Cloud Run**

### **Para usuarios con cuenta Google Cloud:**

#### 1. **Habilitar APIs necesarias**
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 2. **Build y deploy**
```bash
gcloud run deploy soli-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod
```

#### 3. **Configurar base de datos**
Necesitarás Cloud SQL PostgreSQL separadamente.

---

## 🔧 **Configuración de Variables de Entorno**

### **Variables CRÍTICAS que DEBES configurar:**

```bash
# 🔴 OBLIGATORIAS - Base de datos
DB_URL=jdbc:postgresql://host:port/database
DB_USER=usuario
DB_PASSWORD=contraseña

# 🔴 OBLIGATORIAS - AWS (si usas funciones AWS)
MY_AWS_ACCESS_KEY_ID=tu_access_key
MY_AWS_SECRET_ACCESS_KEY=tu_secret_key

# 🔴 OBLIGATORIAS - Cognito Authentication
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_lTSWlzRlA
COGNITO_CLIENT_ID=tu_client_id
COGNITO_CLIENT_SECRET=tu_client_secret
JWK_SET_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_lTSWlzRlA/.well-known/jwks.json

# ✅ OPCIONAL - Con valores por defecto
SPRING_PROFILES_ACTIVE=prod
PORT=8080
JWT_SECRET=E3zYWBhYkzVcJjU/c7QQ1BVKqTRkXRqJVlgHaxtwqyY=
FRONTEND_URL=https://d84l1y8p4kdic.cloudfront.net
```

---

## 📊 **Verificación Post-Despliegue**

### **URLs a probar:**
```bash
# Health check
GET https://tu-app.com/actuator/health

# API V1 (compatibilidad)
GET https://tu-app.com/api/v1/books
GET https://tu-app.com/api/v1/authors

# API V2 (nuevas funcionalidades)
GET https://tu-app.com/api/v2/books?page=0&size=10
GET https://tu-app.com/api/v2/books/search?query=quijote
GET https://tu-app.com/api/v2/books/statistics
GET https://tu-app.com/api/v2/authors?sortBy=name&sortDirection=asc
```

### **Logs importantes a revisar:**
```bash
# Éxito en la conexión a BD
"HikariPool-1 - Start completed"

# Éxito en migraciones
"MIGRACIÓN V2 COMPLETADA EXITOSAMENTE"

# Éxito en configuración
"Started SoliApiApplication in X.XXX seconds"
```

---

## 🚨 **Solución de Problemas Comunes**

### **Error: "Failed to configure a DataSource"**
- ❌ **Problema**: Variables de BD no configuradas
- ✅ **Solución**: Verificar `DB_URL`, `DB_USER`, `DB_PASSWORD`

### **Error: "Unable to connect to Cognito"**
- ❌ **Problema**: Variables de Cognito incorrectas
- ✅ **Solución**: Verificar todas las variables `COGNITO_*`

### **Error: "Port already in use"**
- ❌ **Problema**: Variable `PORT` incorrecta
- ✅ **Solución**: Usar `PORT=8080` o el puerto que asigne la plataforma

### **Error 500 en endpoints V2**
- ❌ **Problema**: Base de datos no tiene las mejoras V2
- ✅ **Solución**: Aplicar `migration_v2.sql` en la BD de producción

---

## 🎯 **Recomendación Final**

### **Para empezar AHORA mismo:**

1. **Ve a Railway.app** (más fácil)
2. **Conecta tu repo GitHub**
3. **Configura las 9 variables de entorno críticas**
4. **Aplica migración V2 a la base de datos**
5. **¡Tu API V1 + V2 estará en línea en 10 minutos!**

### **URLs finales:**
- **API Base**: `https://tu-app.railway.app`
- **Health**: `https://tu-app.railway.app/actuator/health`
- **API V1**: `https://tu-app.railway.app/api/v1/*`
- **API V2**: `https://tu-app.railway.app/api/v2/*`

---

## 📞 **¿Necesitas ayuda?**

Si encuentras problemas:
1. Revisa los logs de la plataforma elegida
2. Verifica que todas las variables estén configuradas
3. Prueba primero el health check
4. Aplica la migración V2 si ves errores en endpoints V2

---

*¡Tu API Soli V1 & V2 está lista para producción!* 🚀