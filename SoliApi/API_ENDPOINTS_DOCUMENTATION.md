# 📚 Documentación Completa de Endpoints - API Soli V1

## 🌐 **Información General**

- **Base URL**: `https://your-service-url.run.app`
- **Versión**: v1.0 (Versionado por URL)
- **Formato**: JSON
- **Autenticación**: JWT Bearer Token
- **Documentación Interactiva**: `/swagger-ui/index.html`

---

## 🔢 **Versionado de API**

### **V1 - Compatible y Estable** `/api/v1/*`
- ✅ **Funcionalidad básica** y probada
- ✅ **Compatible** con frontend actual
- ✅ **Endpoints simples** sin paginación compleja
- 🎯 **Ideal para**: Aplicaciones en producción

### **V2 - Avanzada** `/api/v2/*` (Futuro)
- 🚀 **Paginación avanzada** con metadata
- 🔍 **Filtros múltiples** y búsqueda compleja
- 📊 **Optimizada para rendimiento**
- 🎯 **Ideal para**: Nuevas características

```
---

## 🔐 **Tipos de Seguridad**

| Tipo | Descripción | Header Requerido |
|------|-------------|------------------|
| **Público** | Sin autenticación | Ninguno |
| **JWT Bearer** | Token JWT de Cognito | `Authorization: Bearer <token>` |
| **Admin Only** | Solo usuarios con rol ADMIN | `Authorization: Bearer <admin-token>` |

---

## 📋 **Resumen de Endpoints V1**

### **👤 Usuarios - `/api/v1/user/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v1/user/register` | POST | Público | Registrar usuario en Cognito |
| `/api/v1/user/login` | POST | Público | Iniciar sesión |
| `/api/v1/user/verify-account` | POST | Público | Verificar cuenta con código |
| `/api/v1/user/resend-verification` | POST | Público | Reenviar código de verificación |
| `/api/v1/user/status` | GET | Público | Estado de confirmación de usuario |
| `/api/v1/user/createUser` | POST | JWT Bearer | Completar registro en BD |
| `/api/v1/user/me` | GET | JWT Bearer | Obtener perfil del usuario |
| `/api/v1/user/{cognitoSub}` | GET | Admin Only | Obtener usuario por cognitoSub |
| `/api/v1/user/{id}/active` | PATCH | JWT Bearer | Activar membresía |
| `/api/v1/user/auth/refresh-token` | POST | JWT Bearer | Refrescar tokens |
| `/api/v1/user/auth/logout` | POST | JWT Bearer | Cerrar sesión |
| `/api/v1/user/auth/logout-all` | POST | JWT Bearer | Cerrar todas las sesiones |

### **📚 Libros - `/api/v1/books/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v1/books/all` | GET | JWT Bearer | Obtener todos los libros (simple) |
| `/api/v1/books/{id}` | GET | JWT Bearer | Obtener libro por ID |

### **👨‍💼 Autores - `/api/v1/authors/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v1/authors/all` | GET | JWT Bearer | Obtener todos los autores |

### **🎭 Géneros - `/api/v1/genres/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v1/genres/all` | GET | JWT Bearer | Obtener todos los géneros |

---

## 🔒 **ENDPOINTS DE AUTENTICACIÓN**

### **1. Registro de Usuario**
```http
POST /api/v1/user/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "MySecurePass123"
}
```

**Validaciones:**
- `username`: Email válido, requerido
- `password`: Mínimo 8 caracteres, debe contener mayúscula, minúscula y número

**Response 200:**
```json
"Usuario registrado en Cognito. Revisa tu email para confirmar la cuenta."
```

**Response 400:**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 400,
  "error": "Validation Failed",
  "message": "Los datos enviados no son válidos",
  "path": "/api/v1/user/register",
  "validationErrors": {
    "username": "El formato del email no es válido",
    "password": "La contraseña debe tener al menos 8 caracteres"
  }
}
```

**Response 409:**
```json
"El usuario ya existe"
```

---

### **2. Iniciar Sesión**
```http
POST /api/v1/user/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "MySecurePass123"
}
```

**Response 200 (Usuario confirmado):**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "3600"
}
```

**Response 200 (Usuario no confirmado):**
```json
{
  "status": "UNCONFIRMED"
}
```

---

### **3. Verificar Cuenta**
```http
POST /api/v1/user/verify-account
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "code": "123456"
}
```

**Response 200:**
```json
{
  "status": "SUCCESS"
}
```

---

### **4. Estado de Usuario**
```http
GET /api/v1/user/status?username=user@example.com
```

**Response 200:**
```json
{
  "isConfirmed": true
}
```

---

### **5. Completar Registro en BD**
```http
POST /api/v1/user/createUser
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "activeMember": true,
  "preferredGenreIds": [1, 2, 3]
}
```

**Response 200:**
```json
{
  "id": 123,
  "firstName": "Juan",
  "lastName": "Pérez",
  "activeMember": true,
  "prefferedGenreIds": [1, 2, 3]
}
```

---

### **6. Obtener Perfil del Usuario**
```http
GET /api/v1/user/me
Authorization: Bearer <jwt-token>
```

**Response 200:**
```json
{
  "id": 123,
  "firstName": "Juan",
  "lastName": "Pérez",
  "activeMember": true,
  "prefferedGenreIds": [1, 2, 3]
}
```

---

### **7. Refrescar Token**
```http
POST /api/v1/user/auth/refresh-token
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "3600"
}
```

---

### **8. Cerrar Sesión**
```http
POST /api/v1/user/auth/logout
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "ok": "true"
}
```

---

### **9. Cerrar Todas las Sesiones**
```http
POST /api/v1/user/auth/logout-all
Authorization: Bearer <jwt-token>
```

**Response 200:**
```json
{
  "ok": "true"
}
```

---

## 📚 **ENDPOINTS DE LIBROS V1**

### **10. Obtener Todos los Libros**
```http
GET /api/v1/books/all
Authorization: Bearer <jwt-token>
```

**Descripción:** Lista simple de todos los libros sin paginación (funcionalidad básica V1)

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "El Quijote",
    "description": "La obra maestra de Miguel de Cervantes...",
    "publishedDate": "1605-01-16",
    "textUrl": "https://example.com/texts/quijote.pdf",
    "coverUrl": "https://example.com/covers/quijote.jpg",
    "authors": [
      {
        "id": 1,
        "name": "Miguel",
        "middleName": "de",
        "lastName": "Cervantes",
        "country": "España"
      }
    ],
    "genres": [
      {
        "id": 1,
        "name": "Novela"
      }
    ],
    "editorials": [
      {
        "id": 1,
        "companyName": "Editorial Planeta",
        "countryId": 1,
        "countryName": "España"
      }
    ],
    "type": {
      "id": 1,
      "type": "Libro"
    }
  }
]
```

---

### **11. Obtener Libro por ID**
```http
GET /api/v1/books/{id}
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id`: ID del libro (Long, requerido)

**Response 200:**
```json
{
  "id": 1,
  "title": "El Quijote",
  "description": "La obra maestra de Miguel de Cervantes...",
  "publishedDate": "1605-01-16",
  "textUrl": "https://example.com/texts/quijote.pdf",
  "coverUrl": "https://example.com/covers/quijote.jpg",
  "authors": [
    {
      "id": 1,
      "name": "Miguel",
      "middleName": "de",
      "lastName": "Cervantes",
      "country": "España"
    }
  ],
  "genres": [
    {
      "id": 1,
      "name": "Novela"
    }
  ],
  "editorials": [
    {
      "id": 1,
      "companyName": "Editorial Planeta",
      "countryId": 1,
      "countryName": "España"
    }
  ],
  "type": {
    "id": 1,
    "type": "Libro"
  }
}
```

**Response 404:**
```json
{
  "timestamp": "2024-10-14T05:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Libro no encontrado",
  "path": "/api/v1/books/999"
}
```

---

## 👨‍💼 **ENDPOINTS DE AUTORES V1**

### **12. Obtener Todos los Autores**
```http
GET /api/v1/authors/all
Authorization: Bearer <jwt-token>
```

**Descripción:** Lista simple de todos los autores (funcionalidad básica V1)

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Miguel",
    "middleName": "de",
    "lastName": "Cervantes",
    "country": "España"
  },
  {
    "id": 2,
    "name": "Gabriel",
    "middleName": "García",
    "lastName": "Márquez",
    "country": "Colombia"
  }
]
```

---

## 🎭 **ENDPOINTS DE GÉNEROS V1**

### **13. Obtener Todos los Géneros**
```http
GET /api/v1/genres/all
Authorization: Bearer <jwt-token>
```

**Descripción:** Lista simple de todos los géneros (funcionalidad básica V1)

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Novela"
  },
  {
    "id": 2,
    "name": "Ciencia Ficción"
  },
  {
    "id": 3,
    "name": "Fantasía"
  }
]
```

---

## 🚨 **CÓDIGOS DE ERROR COMUNES**

### **400 - Bad Request**
```json
{
  "timestamp": "2024-10-14T05:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Datos de entrada inválidos",
  "path": "/api/v1/user/createUser",
  "validationErrors": {
    "firstName": "El nombre es requerido",
    "lastName": "El apellido es requerido"
  }
}
```

### **401 - Unauthorized**
```json
{
  "timestamp": "2024-10-14T05:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token JWT inválido o expirado",
  "path": "/api/v1/user/me"
}
```

### **403 - Forbidden**
```json
{
  "timestamp": "2024-10-14T05:30:00",
  "status": 403,
  "error": "Forbidden", 
  "message": "Acceso denegado - Requiere rol de administrador",
  "path": "/api/v1/user/123"
}
```

### **404 - Not Found**
```json
{
  "timestamp": "2024-10-14T05:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Recurso no encontrado",
  "path": "/api/v1/books/999"
}
```

### **500 - Internal Server Error**
```json
{
  "timestamp": "2024-10-14T05:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Error interno del servidor",
  "path": "/api/v1/books/all"
}
```

---

## 🔗 **Swagger UI - Documentación Interactiva**

### **Acceso a la Documentación:**
```
https://your-service-url.run.app/swagger-ui/index.html
```

### **Grupos Disponibles:**
- **API V1 - Compatible**: Solo endpoints `/api/v1/*`
- **Todas las versiones**: Endpoints de todas las versiones
- **API V2 - Avanzada**: Solo endpoints `/api/v2/*` (cuando esté disponible)

---

## 🆚 **Migración del Frontend**

### **Cambios Requeridos:**
```javascript
// ANTES (sin versionado)
const response = await fetch('/user/login', {
  method: 'POST',
  body: JSON.stringify(loginData)
});

// DESPUÉS (V1 versionado)
const response = await fetch('/api/v1/user/login', {
  method: 'POST', 
  body: JSON.stringify(loginData)
});
```

### **Endpoints Nuevos Disponibles:**
```javascript
// Libros
const books = await fetch('/api/v1/books/all');
const book = await fetch('/api/v1/books/123');

// Autores
const authors = await fetch('/api/v1/authors/all');

// Géneros  
const genres = await fetch('/api/v1/genres/all');
```

---

## 🔮 **Próximas Funcionalidades (V2)**

### **Características Planificadas:**
- 📄 **Paginación avanzada** con metadata
- 🔍 **Filtros múltiples** por género, autor, fecha
- 📊 **Ordenamiento flexible** 
- 🚀 **Búsqueda de texto completo**
- ⚡ **Optimización de rendimiento**

### **Endpoints V2 Futuros:**
```http
GET /api/v2/books?search=quijote&genreIds=1,2&page=0&size=20
GET /api/v2/authors?name=cervantes&country=españa
GET /api/v2/genres?name=novela
```

---

## 📞 **Soporte y Contacto**

- **Documentación**: [Swagger UI](https://your-service-url.run.app/swagger-ui/index.html)
- **Logs**: Disponibles en Google Cloud Console
- **Estado del Servicio**: Endpoint `/actuator/health`

---

*Documentación generada para API Soli V1 - Última actualización: Octubre 2024*