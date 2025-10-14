# 📚 Documentación Completa de Endpoints - API Soli

## 🌐 **URL Base de la API**
```
https://soliapi-223325065421.northamerica-south1.run.app

---

## 🔐 **Tipos de Seguridad**

| Tipo | Descripción | Header Requerido |
|------|-------------|------------------|
| **Público** | Sin autenticación | Ninguno |
| **JWT Bearer** | Token JWT de Cognito | `Authorization: Bearer <token>` |
| **Admin Only** | Solo usuarios con rol ADMIN | `Authorization: Bearer <admin-token>` |

---

## 📋 **Resumen de Endpoints**

| Endpoint | Método | Seguridad | Descripción |
|----------|---------|-----------|-------------|
| `/user/register` | POST | Público | Registrar usuario en Cognito |
| `/user/login` | POST | Público | Iniciar sesión |
| `/user/verify-account` | POST | Público | Verificar cuenta con código |
| `/user/resend-verification` | POST | Público | Reenviar código de verificación |
| `/user/status` | GET | Público | Estado de confirmación de usuario |
| `/user/createUser` | POST | JWT Bearer | Completar registro en BD |
| `/user/me` | GET | JWT Bearer | Obtener perfil del usuario |
| `/user/{cognitoSub}` | GET | Admin Only | Obtener usuario por cognitoSub |
| `/user/{id}/active` | PATCH | JWT Bearer | Activar membresía |
| `/user/auth/refresh-token` | POST | JWT Bearer | Refrescar tokens |
| `/user/auth/logout` | POST | JWT Bearer | Cerrar sesión |
| `/user/auth/logout-all` | POST | JWT Bearer | Cerrar todas las sesiones |
| `/books` | GET | JWT Bearer | Buscar y filtrar libros |
| `/books/all` | GET | JWT Bearer | Obtener todos los libros |
| `/books/{id}` | GET | JWT Bearer | Obtener libro por ID |
| `/books` | POST | Admin Only | Crear libro |
| `/books/{id}` | PUT | Admin Only | Actualizar libro |
| `/books/{id}` | DELETE | Admin Only | Eliminar libro |
| `/authors` | GET | JWT Bearer | Buscar autores |
| `/authors/{id}` | GET | JWT Bearer | Obtener autor por ID |
| `/authors` | POST | Admin Only | Crear autor |
| `/authors/{id}` | DELETE | Admin Only | Eliminar autor |
| `/genres` | GET | JWT Bearer | Buscar géneros |
| `/genres/{id}` | GET | JWT Bearer | Obtener género por ID |
| `/genres` | POST | Admin Only | Crear género |
| `/genres/{id}` | DELETE | Admin Only | Eliminar género |

---

## 🔒 **ENDPOINTS DE AUTENTICACIÓN**

### **1. Registro de Usuario**
```http
POST /user/register
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
  "path": "/user/register",
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
POST /user/login
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
POST /user/verify-account
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "code": "123456"
}
```

**Validaciones:**
- `username`: Email válido
- `code`: Exactamente 6 dígitos

**Response 200:**
```json
{
  "status": "SUCCESS"
}
```

**Response 400:**
```json
{
  "status": "INVALID_CODE"
}
```

**Response 400 (Código expirado):**
```json
{
  "status": "CODE_EXPIRED"
}
```

---

### **4. Estado de Usuario**
```http
GET /user/status?username=user@example.com
```

**Query Parameters:**
- `username`: Email del usuario (requerido)

**Response 200:**
```json
{
  "isConfirmed": true
}
```

---

## 👤 **ENDPOINTS DE USUARIO**

### **5. Completar Registro en BD**
```http
POST /user/createUser
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "activeMember": true,
  "preferredGenreIds": [1, 3, 5]
}
```

**Validaciones:**
- `firstName`: 2-50 caracteres, requerido
- `lastName`: 2-50 caracteres, requerido  
- `activeMember`: Boolean, requerido
- `preferredGenreIds`: Opcional, array de IDs de géneros

**Response 200:**
```json
{
  "id": 123,
  "firstName": "Juan",
  "lastName": "Pérez",
  "activeMember": true,
  "prefferedGenreIds": [1, 3, 5]
}
```

**Response 400 (Usuario ya existe):**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 400,
  "error": "Business Logic Error",
  "message": "El usuario ya existe en la base de datos",
  "path": "/user/createUser"
}
```

---

### **6. Obtener Perfil del Usuario**
```http
GET /user/me
Authorization: Bearer <jwt-token>
```

**Response 200:**
```json
{
  "id": 123,
  "firstName": "Juan",
  "lastName": "Pérez",
  "activeMember": true,
  "prefferedGenreIds": [1, 3, 5]
}
```

**Response 400 (Usuario no registrado en BD):**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 400,
  "error": "Business Logic Error",
  "message": "Usuario no encontrado. Debe completar el registro en la base de datos.",
  "path": "/user/me"
}
```

---

### **7. Refrescar Token**
```http
POST /user/auth/refresh-token
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
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **8. Cerrar Sesión**
```http
POST /user/auth/logout
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

## 📚 **ENDPOINTS DE LIBROS**

### **9. Buscar y Filtrar Libros (CON PAGINACIÓN)**
```http
GET /books?search=harry&genreIds=1,2&page=0&size=10&sortBy=title&sortDirection=ASC
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `search` | String | Búsqueda en título y descripción | `harry potter` |
| `title` | String | Filtrar por título específico | `harry` |
| `authorName` | String | Filtrar por nombre de autor | `tolkien` |
| `genreIds` | Array | IDs de géneros | `1,2,3` |
| `editorialIds` | Array | IDs de editoriales | `1,4` |
| `typeId` | Long | ID de tipo de texto | `1` |
| `publishedAfter` | Date | Fecha desde (YYYY-MM-DD) | `2020-01-01` |
| `publishedBefore` | Date | Fecha hasta (YYYY-MM-DD) | `2024-12-31` |
| `page` | Integer | Número de página (0-based) | `0` |
| `size` | Integer | Elementos por página (1-100) | `20` |
| `sortBy` | String | Campo ordenamiento | `title`, `publishedDate`, `id` |
| `sortDirection` | String | Dirección | `ASC`, `DESC` |

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Harry Potter y la Piedra Filosofal",
      "description": "La historia del niño que vivió...",
      "publishedDate": "1997-06-26",
      "textUrl": "https://storage.googleapis.com/bucket/book1.pdf",
      "coverUrl": "https://storage.googleapis.com/bucket/cover1.jpg",
      "authors": [
        {
          "id": 1,
          "name": "J.K.",
          "middleName": null,
          "lastName": "Rowling",
          "country": "Reino Unido"
        }
      ],
      "editorials": [
        {
          "id": 1,
          "name": "Bloomsbury",
          "countryId": 1,
          "countryName": "Reino Unido"
        }
      ],
      "genres": [
        {
          "id": 1,
          "name": "Fantasía"
        },
        {
          "id": 2,
          "name": "Juvenil"
        }
      ],
      "type": {
        "id": 1,
        "name": "Novela"
      }
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 156,
  "totalPages": 16,
  "first": true,
  "last": false,
  "hasNext": true,
  "hasPrevious": false
}
```

---

### **10. Obtener Libro por ID**
```http
GET /books/1
Authorization: Bearer <jwt-token>
```

**Response 200:**
```json
{
  "id": 1,
  "title": "Harry Potter y la Piedra Filosofal",
  "description": "La historia del niño que vivió...",
  "publishedDate": "1997-06-26",
  "textUrl": "https://storage.googleapis.com/bucket/book1.pdf",
  "coverUrl": "https://storage.googleapis.com/bucket/cover1.jpg",
  "authors": [...],
  "editorials": [...],
  "genres": [...],
  "type": {...}
}
```

**Response 404:**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 404,
  "error": "Not Found",
  "message": "Libro no encontrado",
  "path": "/books/999"
}
```

---

### **11. Crear Libro (ADMIN ONLY)**
```http
POST /books
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Nuevo Libro",
  "description": "Descripción del libro con más de 10 caracteres",
  "publishedDate": "2024-01-15",
  "textUrl": "https://storage.googleapis.com/bucket/new-book.pdf",
  "coverUrl": "https://storage.googleapis.com/bucket/new-cover.jpg",
  "authorIds": [1, 2],
  "editorialIds": [1],
  "genreIds": [1, 3],
  "typeId": 1
}
```

**Validaciones:**
- `title`: 1-200 caracteres, requerido
- `description`: 10-2000 caracteres, requerido
- `publishedDate`: Fecha válida, requerida
- `textUrl`: URL válida, requerida
- `coverUrl`: URL válida, requerida
- `authorIds`: Al menos 1 ID, requerido
- `editorialIds`: Al menos 1 ID, requerido
- `genreIds`: Al menos 1 ID, requerido
- `typeId`: ID válido, requerido

**Response 200:**
```json
{
  "id": 157,
  "title": "Nuevo Libro",
  "description": "Descripción del libro...",
  // ... resto de campos
}
```

---

## 👥 **ENDPOINTS DE AUTORES**

### **12. Buscar Autores**
```http
GET /authors?name=tolkien&country=reino
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `name`: Buscar en nombre del autor
- `country`: Buscar en nombre del país

**Response 200:**
```json
[
  {
    "id": 2,
    "name": "J.R.R.",
    "middleName": null,
    "lastName": "Tolkien",
    "country": "Reino Unido"
  }
]
```

---

## 🎭 **ENDPOINTS DE GÉNEROS**

### **13. Buscar Géneros**
```http
GET /genres?name=fanta
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `name`: Buscar géneros que contengan el texto

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Fantasía"
  },
  {
    "id": 5,
    "name": "Fantasía Épica"
  }
]
```

---

## ⚠️ **RESPUESTAS DE ERROR COMUNES**

### **Error de Validación (400)**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 400,
  "error": "Validation Failed",
  "message": "Los datos enviados no son válidos",
  "path": "/books",
  "validationErrors": {
    "size": "El tamaño de página no puede ser mayor a 100"
  }
}
```

### **Token Inválido/Expirado (401)**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 401,
  "error": "Authentication Failed",
  "message": "Credenciales inválidas o token expirado",
  "path": "/user/me"
}
```

### **Sin Permisos (403)**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 403,
  "error": "Access Denied",
  "message": "No tienes permisos para acceder a este recurso",
  "path": "/books"
}
```

### **Recurso No Encontrado (404)**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 404,
  "error": "Not Found",
  "message": "Libro no encontrado",
  "path": "/books/999"
}
```

### **Error del Servidor (500)**
```json
{
  "timestamp": "2024-10-14T04:49:43",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Ha ocurrido un error interno del servidor",
  "path": "/books"
}
```

---

## 🚀 **Endpoints Adicionales**

### **Swagger UI**
```http
GET /swagger-ui/index.html
```
Interfaz interactiva para probar la API

### **API Documentation**
```http
GET /v3/api-docs
```
Documentación OpenAPI en formato JSON

---

## 📝 **Notas Importantes**

1. **Tokens JWT**: Los tokens de Cognito tienen una duración limitada. Usa el refresh token para obtener nuevos tokens.

2. **Paginación**: Todos los endpoints de listado soportan paginación. El tamaño máximo de página es 100.

3. **Filtros**: Los filtros son opcionales y se pueden combinar para búsquedas complejas.

4. **Roles**: 
   - `READER`: Puede leer libros, autores, géneros
   - `ADMIN`: Puede crear, actualizar y eliminar contenido

5. **Rate Limiting**: La API puede tener límites de velocidad. Respeta los headers de rate limiting en las respuestas.

6. **CORS**: La API está configurada para aceptar requests desde cualquier origen durante desarrollo. En producción, configura dominios específicos.

7. **Logging**: Todos los errores se registran en los logs de Cloud Run para debugging.

¡Tu API Soli está completamente documentada y lista para usar! 🎉