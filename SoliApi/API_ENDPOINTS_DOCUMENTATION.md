# 📚 Documentación Completa de Endpoints - API Soli (V1 & V2)

## 🌐 **Información General**

- **Base URL**: `https://your-service-url.run.app`
- **Versiones**: v1.0 (Estable) & v2.0 (Avanzada)
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
- 📱 **Estado**: **DISPONIBLE**

### **V2 - Avanzada y Optimizada** `/api/v2/*`
- 🚀 **Paginación avanzada** con metadata completa
- 🔍 **Filtros múltiples** y búsqueda compleja
- 📊 **Estadísticas** y analytics incorporados
- ⚡ **Optimizada para rendimiento**
- 🎯 **Ideal para**: Aplicaciones modernas y nuevas características
- 📱 **Estado**: **DISPONIBLE**

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

# 🚀 **API V2 - AVANZADA Y OPTIMIZADA**

## 📊 **Resumen de Endpoints V2**

### **👤 Usuarios - `/api/v2/user/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v2/user/register` | POST | Público | Registrar usuario con validación mejorada |
| `/api/v2/user/login` | POST | Público | Iniciar sesión con detalles avanzados |
| `/api/v2/user/verify-account` | POST | Público | Verificar cuenta con metadata |
| `/api/v2/user/resend-verification` | POST | Público | Reenviar código con seguimiento |
| `/api/v2/user/status` | GET | Público | Estado detallado del usuario |
| `/api/v2/user/createUser` | POST | JWT Bearer | Completar registro con validación avanzada |
| `/api/v2/user/me` | GET | JWT Bearer | Perfil completo del usuario |
| `/api/v2/user/{cognitoSub}` | GET | Admin Only | Obtener usuario con metadata completa |
| `/api/v2/user/{id}/active` | PATCH | JWT Bearer | Activar membresía con auditoria |
| `/api/v2/user/auth/refresh-token` | POST | JWT Bearer | Refrescar tokens con seguimiento |
| `/api/v2/user/auth/logout` | POST | JWT Bearer | Cerrar sesión con limpieza avanzada |
| `/api/v2/user/auth/logout-all` | POST | JWT Bearer | Cerrar todas las sesiones con auditoria |

### **📚 Libros - `/api/v2/books/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v2/books` | GET | JWT Bearer | Búsqueda avanzada con filtros y paginación |
| `/api/v2/books/all` | GET | JWT Bearer | Todos los libros con paginación |
| `/api/v2/books/{id}` | GET | JWT Bearer | Libro por ID con detalles completos |
| `/api/v2/books/search` | GET | JWT Bearer | Búsqueda de texto completo |
| `/api/v2/books/by-author/{authorId}` | GET | JWT Bearer | Libros por autor con filtros |
| `/api/v2/books/by-genre/{genreId}` | GET | JWT Bearer | Libros por género con filtros |
| `/api/v2/books/stats` | GET | JWT Bearer | Estadísticas de libros |

### **👨‍💼 Autores - `/api/v2/authors/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v2/authors` | GET | JWT Bearer | Búsqueda con filtros combinados |
| `/api/v2/authors/all` | GET | JWT Bearer | Todos los autores |
| `/api/v2/authors/search/name` | GET | JWT Bearer | Búsqueda por nombre |
| `/api/v2/authors/search/country` | GET | JWT Bearer | Búsqueda por país |
| `/api/v2/authors/stats` | GET | JWT Bearer | Estadísticas de autores |

### **🎭 Géneros - `/api/v2/genres/*`**
| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/api/v2/genres` | GET | JWT Bearer | Búsqueda avanzada de géneros |
| `/api/v2/genres/all` | GET | JWT Bearer | Todos los géneros |
| `/api/v2/genres/popular` | GET | JWT Bearer | Géneros más populares |
| `/api/v2/genres/stats` | GET | JWT Bearer | Estadísticas de géneros |

---

## 📚 **ENDPOINTS DE LIBROS V2 - AVANZADOS**

### **1. Búsqueda Avanzada de Libros**
```http
GET /api/v2/books?title=quijote&authorIds=1,2&genreIds=3&editorialIds=4&published_after=2000-01-01&page=0&size=10&sort=title,asc
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `title` (opcional): Título del libro (búsqueda parcial)
- `authorIds` (opcional): IDs de autores separados por comas
- `genreIds` (opcional): IDs de géneros separados por comas
- `editorialIds` (opcional): IDs de editoriales separados por comas
- `published_after` (opcional): Fecha de publicación mínima (YYYY-MM-DD)
- `published_before` (opcional): Fecha de publicación máxima (YYYY-MM-DD)
- `page` (opcional, default: 0): Página solicitada
- `size` (opcional, default: 20): Tamaño de página
- `sort` (opcional): Ordenamiento (title,publishedDate,id) + dirección (asc,desc)

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "El Quijote",
      "description": "La obra maestra de Miguel de Cervantes...",
      "publishedDate": "1605-01-16",
      "textUrl": "https://example.com/texts/quijote.pdf",
      "coverUrl": "https://example.com/covers/quijote.jpg",
      "authors": [...],
      "genres": [...],
      "editorials": [...],
      "type": {...}
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 150,
  "totalPages": 15,
  "last": false,
  "first": true,
  "numberOfElements": 10,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "empty": false
}
```

---

### **2. Estadísticas de Libros**
```http
GET /api/v2/books/stats
Authorization: Bearer <jwt-token>
```

**Response 200:**
```json
{
  "totalBooks": 1250,
  "message": "Estadísticas avanzadas de libros V2",
  "uniqueAuthors": 450,
  "uniqueGenres": 25,
  "uniqueEditorials": 75,
  "booksPublishedThisYear": 50,
  "averageBooksPerAuthor": 2.78,
  "mostPopularGenres": [
    {"genreId": 1, "genreName": "Novela", "bookCount": 350},
    {"genreId": 2, "genreName": "Ciencia Ficción", "bookCount": 200}
  ],
  "newestBooks": 15,
  "oldestBooks": 5
}
```

---

### **3. Libros por Autor (V2)**
```http
GET /api/v2/books/by-author/1?page=0&size=5&sort=publishedDate,desc
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `authorId`: ID del autor

**Query Parameters:**
- `page`, `size`, `sort`: Parámetros de paginación

**Response 200:** (Formato Page con metadata completa)

---

## 👨‍💼 **ENDPOINTS DE AUTORES V2 - AVANZADOS**

### **4. Búsqueda Combinada de Autores**
```http
GET /api/v2/authors?name=cervantes&country=españa
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `name` (opcional): Nombre del autor (búsqueda parcial)
- `country` (opcional): País del autor (búsqueda parcial)

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Miguel",
    "middleName": "de",
    "lastName": "Cervantes",
    "countryName": "España"
  }
]
```

---

### **5. Estadísticas de Autores**
```http
GET /api/v2/authors/stats
Authorization: Bearer <jwt-token>
```

**Response 200:**
```json
{
  "totalAuthors": 450,
  "message": "Estadísticas básicas de autores V2",
  "uniqueCountries": 35
}
```

---

## 🎭 **ENDPOINTS DE GÉNEROS V2 - AVANZADOS**

### **6. Búsqueda de Géneros por Nombre**
```http
GET /api/v2/genres?name=novela
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `name` (opcional): Nombre del género (búsqueda parcial)

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Novela"
  },
  {
    "id": 5,
    "name": "Novela Histórica"
  }
]
```

---

### **7. Géneros Populares**
```http
GET /api/v2/genres/popular
Authorization: Bearer <jwt-token>
```

**Descripción:** Devuelve los géneros ordenados por popularidad (número de libros)

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
  }
]
```

---

### **8. Estadísticas de Géneros**
```http
GET /api/v2/genres/stats
Authorization: Bearer <jwt-token>
```

**Response 200:**
```json
{
  "totalGenres": 25,
  "message": "Estadísticas avanzadas de géneros V2"
}
```

---

## 👤 **ENDPOINTS DE USUARIOS V2 - MEJORADOS**

### **9. Registro Mejorado V2**
```http
POST /api/v2/user/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "MySecurePass123"
}
```

**Response 200:**
```json
{
  "message": "Usuario registrado exitosamente en Cognito. Revisa tu email para confirmar la cuenta.",
  "username": "user@example.com",
  "timestamp": "2024-10-14T06:00:00Z",
  "requiresVerification": true
}
```

---

### **10. Login Mejorado V2**
```http
POST /api/v2/user/login
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
  "expiresIn": "3600",
  "tokenType": "Bearer",
  "loginTimestamp": "2024-10-14T06:00:00Z",
  "userStatus": "CONFIRMED"
}
```

**Response 200 (Usuario no confirmado):**
```json
{
  "status": "UNCONFIRMED",
  "message": "Usuario no confirmado. Verificación requerida.",
  "requiresVerification": true
}
```

---

## 🎆 **CARACTERÍSTICAS AVANZADAS V2**

### **📊 Paginación Mejorada**
- Metadata completa de paginación
- Control total sobre tamaño de página
- Información de ordenamiento incluida
- Compatibilidad con Spring Data

### **🔍 Filtros Múltiples** 
- Combinación de filtros por URL
- Búsqueda de texto parcial
- Filtros por rangos de fecha
- Filtros por múltiples entidades

### **📊 Analytics y Estadísticas**
- Contadores de recursos
- Estadísticas de popularidad
- Resumen de datos
- Métricas de uso

### **⚡ Optimización de Rendimiento**
- Consultas optimizadas
- Caché inteligente
- Lazy loading
- Proyecciones eficientes

---

## 🗺️ **GUÍA DE MIGRACIÓN V1 → V2**

### **✨ Ventajas de Migrar a V2:**

| Característica | V1 | V2 |
|-----------------|----|----||
| **Paginación** | ❌ Sin paginación | ✅ Paginación completa con metadata |
| **Filtros** | ❌ Sin filtros | ✅ Filtros múltiples y combinados |
| **Búsqueda** | ❌ Solo por ID | ✅ Búsqueda de texto y combinada |
| **Estadísticas** | ❌ No disponibles | ✅ Analytics y métricas |
| **Rendimiento** | ⚠️ Básico | ✅ Optimizado y caché |
| **Ordenamiento** | ❌ No disponible | ✅ Flexible y dinámico |

### **🔄 Ejemplos de Migración:**

#### **Libros:**
```javascript
// V1 - Lista simple
const booksV1 = await fetch('/api/v1/books/all');

// V2 - Con paginación y filtros
const booksV2 = await fetch('/api/v2/books?page=0&size=20&sort=title,asc');
const filteredBooks = await fetch('/api/v2/books?title=quijote&genreIds=1,2');
```

#### **Autores:**
```javascript
// V1 - Lista simple
const authorsV1 = await fetch('/api/v1/authors/all');

// V2 - Con filtros
const authorsV2 = await fetch('/api/v2/authors?name=cervantes&country=españa');
const authorStats = await fetch('/api/v2/authors/stats');
```

#### **Géneros:**
```javascript
// V1 - Lista simple
const genresV1 = await fetch('/api/v1/genres/all');

// V2 - Con búsqueda y estadísticas
const genresV2 = await fetch('/api/v2/genres?name=novela');
const popularGenres = await fetch('/api/v2/genres/popular');
const genreStats = await fetch('/api/v2/genres/stats');
```

### **🚨 Consideraciones de Migración:**

1. **Respuestas Paginadas**: V2 devuelve objetos `Page` para listas
2. **Parámetros de Query**: V2 usa parámetros de URL para filtros
3. **Metadata Adicional**: V2 incluye más información en las respuestas
4. **Rendimiento**: V2 es más eficiente para grandes volúmenes de datos

---

## 💨 **CÓDIGOS DE ERROR COMUNES**

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
- **API V1 - Compatible**: Solo endpoints `/api/v1/*` - Funcionalidad básica
- **API V2 - Avanzada**: Solo endpoints `/api/v2/*` - Con paginación, filtros y estadísticas
- **Todas las versiones**: Endpoints de todas las versiones disponibles

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

*Documentación generada para API Soli V1 & V2 - Última actualización: Octubre 2024*

---

## 📈 **ESTADO ACTUAL DE LAS VERSIONES**

### **V1 - Producción** ✅
- **Estado**: **ESTABLE Y DISPONIBLE**
- **Características**: Funcionalidad básica, compatibilidad garantizada
- **Recomendado para**: Aplicaciones existentes, integraciones rápidas

### **V2 - Producción** ✅
- **Estado**: **DISPONIBLE Y OPTIMIZADA**
- **Características**: Paginación, filtros avanzados, estadísticas, rendimiento mejorado
- **Recomendado para**: Nuevas aplicaciones, características avanzadas

### **Compatibilidad**
- Ambas versiones funcionan simultáneamente
- No hay planes de deprecación para V1
- V2 es completamente independiente de V1
- Migración gradual recomendada
