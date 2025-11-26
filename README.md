## Visión General de la API (v3)

La API de SoliBooks está diseñada siguiendo los principios RESTful y utiliza un sistema de autenticación basado en JWT a través de AWS Cognito. La API está versionada bajo el prefijo `/api/v3`.

### Autenticación

Todos los endpoints que requieren autenticación esperan un `Access Token` de Cognito en la cabecera `Authorization` con el formato `Bearer [token]`.

---

### Endpoints Públicos

Estos endpoints no requieren autenticación.

#### Autenticación (`/auth`)
*   `POST /auth/register`: Registra un nuevo usuario.
*   `POST /auth/confirm-signup`: Confirma el registro con el código enviado por email.
*   `POST /auth/login`: Inicia sesión y devuelve los tokens (`access`, `id`, `refresh`).
*   `POST /auth/refresh-token`: Obtiene un nuevo `access token` usando un `refresh token`.
*   `POST /auth/forgot-password`: Inicia el proceso de recuperación de contraseña.
*   `POST /auth/confirm-forgot-password`: Completa el proceso de recuperación con una nueva contraseña.

#### Libros (`/books`)
*   `GET /books`: Búsqueda avanzada y paginada de libros con múltiples filtros.
*   `GET /books/{id}`: Obtiene los detalles completos de un solo libro.
*   `GET /books/by-ids`: Obtiene una lista de libros a partir de sus IDs.

#### Reseñas (`/reviews`)
*   `GET /books/{bookId}/reviews`: Obtiene una lista paginada de las reseñas de un libro.

---

### Endpoints Protegidos (Requieren Autenticación)

#### Gestión de Usuario (`/users`)
*   `POST /users`: Permite a un usuario recién registrado crear su perfil en la base de datos.
*   `GET /users/me`: Obtiene el perfil del usuario autenticado.
*   `PUT /users/me`: Actualiza el perfil del usuario autenticado.
*   `GET /users/me/favorites`: Obtiene la lista de libros favoritos del usuario.
*   `POST /users/me/favorites/{bookId}`: Añade un libro a favoritos.
*   `DELETE /users/me/favorites/{bookId}`: Elimina un libro de favoritos.
*   `GET /users/me/progress`: Obtiene el progreso de lectura de todos los libros del usuario.
*   `PUT /users/me/progress/{bookId}`: Guarda o actualiza el progreso de lectura para un libro.

#### Estanterías (`/bookshelves`)
*   `POST /bookshelves`: Crea una nueva estantería virtual para el usuario.
*   `GET /bookshelves/me`: Lista todas las estanterías del usuario.
*   `GET /bookshelves/{shelfId}`: Obtiene los detalles y la lista de libros de una estantería.
*   `PUT /bookshelves/{shelfId}`: Actualiza el nombre o descripción de una estantería.
*   `DELETE /bookshelves/{shelfId}`: Elimina una estantería.
*   `POST /bookshelves/{shelfId}/books/{bookId}`: Añade un libro a una estantería.
*   `DELETE /bookshelves/{shelfId}/books/{bookId}`: Quita un libro de una estantería.

#### Reseñas (`/reviews`)
*   `POST /books/{bookId}/reviews`: Permite al usuario autenticado crear una reseña.
*   `PUT /reviews/{reviewId}`: Permite al usuario actualizar su propia reseña.
*   `DELETE /reviews/{reviewId}`: Permite al usuario eliminar su propia reseña.

---

### Endpoints de Administración (`/admin`)

Estos endpoints requieren que el usuario tenga el rol `ADMIN`. Algunos endpoints de lectura (`GET`) también son accesibles para el rol `READER`.

*   **Gestión de Libros**:
    *   `POST /admin/books`: Crear un libro.
    *   `POST /admin/books/batch`: Crear múltiples libros en una sola petición.
    *   `PUT /admin/books/{id}`: Actualizar un libro.
    *   `DELETE /admin/books/{id}`: Eliminar un libro.
*   **Gestión de Catálogo (Autores, Géneros, Países, Editoriales, Tipos de Texto)**:
    *   Para cada una de estas entidades, existen los 5 endpoints CRUD estándar:
        *   `GET /admin/{entidad}`: Listar todos.
        *   `GET /admin/{entidad}/{id}`: Obtener uno.
        *   `POST /admin/{entidad}`: Crear uno nuevo.
        *   `PUT /admin/{entidad}/{id}`: Actualizar uno existente.
        *   `DELETE /admin/{entidad}/{id}`: Eliminar uno.
*   **Gestión de Usuarios**:
    *   `GET /admin/users`: Listar todos los usuarios de la base de datos.
    *   `GET /admin/users/{id}`: Obtener un usuario por su ID de la base de datos.
    *   `DELETE /admin/users/{id}`: Eliminar un usuario (tanto de la base de datos como de Cognito).

# 📱 Aplicación Android

La aplicación móvil de SoliBooks está desarrollada de forma nativa con:

- Kotlin 100%
- Jetpack Compose para toda la UI
- Arquitectura basada en principios modernos de Android

La app funciona como cliente de la API SoliBooks y permite una experiencia fluida para usuarios y administradores.

---

# 🧩 Arquitectura de la App

- **Lenguaje:** Kotlin  
- **UI:** Jetpack Compose  
- **Arquitectura:** MVVM  
- **Gestión de Estado:** StateFlow y Flow  
- **Asincronía:** Coroutines  
- **Inyección de dependencias:** Hilt  
- **Consumo de API:** Retrofit + Moshi/Gson  
- **Persistencia local:** Room  
- **Navegación:** Navigation Compose  

---

# 🚀 Funcionalidades Implementadas

## 🔐 Autenticación
- Registro  
- Login  
- Confirmación de correo  
- Recuperación de contraseña  

Mapeadas a los endpoints `/auth`.

---

## 🛠️ Panel Administrador

Incluye funciones completas de CRUD sobre libros:

- Listar  
- Crear  
- Editar  
- Eliminar  

La pantalla principal **BookListScreen.kt** utiliza:
- `LazyColumn`
- `FloatingActionButton`
- Iconos para editar/eliminar
- Integración con `AdminViewModel`  
- Comunicación con `/admin/books`

---

## 🔍 Exploración de Libros
- Búsquedas    
- Detalles del libro    

---

## 👤 Gestión de Perfil
- Ver y actualizar información personal  
- Favoritos sincronizados   

---

# 💡 Tecnologías Utilizadas

### Mobile
- Kotlin
- Jetpack Compose
- Retrofit
- Coroutines
- Navigation Compose

---

# Aplicación Web 🖥️

La aplicación web de SoliBooks está desarrollada con tecnologías modernas de frontend:

* React con TypeScript
* Vite como bundler y servidor de desarrollo
* Arquitectura basada en componentes modulares y reutilizables

La app funciona como cliente de la API SoliBooks y permite una experiencia fluida y responsiva para usuarios y administradores en cualquier dispositivo.

## 🧩 Arquitectura de la App

* **Lenguaje:** TypeScript
* **Framework:** React 18
* **Build Tool:** Vite
* **Estilos:** CSS Modules
* **Routing:** React Router DOM
* **Consumo de API:** Fetch API nativo
* **Visor de PDFs:** React-PDF (PDF.js)
* **Gestión de Estado:** React Hooks (useState, useEffect, useContext)
* **Despliegue:** Netlify con proxy para CORS

## 🚀 Funcionalidades Implementadas

### 🔐 Autenticación

* Registro de usuarios
* Login con validación
* Confirmación de correo electrónico
* Recuperación de contraseña
* Sistema de tokens JWT
* Mapeadas a los endpoints `/auth`.

### 🛠️ Panel Administrador

Incluye funciones completas de CRUD sobre:

#### 📚 Libros
* Listar con búsqueda y filtros
* Crear con selección múltiple de autores, editoriales y géneros
* Editar información
* Eliminar

#### ✍️ Autores
* Gestión completa de autores
* CRUD con información de país

#### 🏢 Editoriales
* Gestión de casas editoriales
* Información de ubicación

#### 🎭 Géneros Literarios
* Categorización de libros
* CRUD de géneros

#### 📖 Tipos de Texto
* Clasificación por formato (Épica, Novela, Cuento, etc.)

La interfaz administrativa utiliza:
* Modales para formularios
* Tablas responsivas
* Confirmaciones de eliminación
* Notificaciones toast
* Integración con servicios dedicados (adminService.ts)
* Comunicación con `/admin/*` endpoints

### 🔍 Exploración de Libros

* Búsqueda por título, autor o género
* Filtros por tipo de texto y editorial
* Vista de detalles completos
* Visualización de portadas
* Links a formatos PDF y EPUB

### 📚 Visor de PDFs Integrado

* Renderizado nativo con React-PDF
* Navegación página por página
* Controles de navegación intuitivos
* Detección automática de página actual
* Guardado automático de progreso de lectura
* Compatibilidad con todos los navegadores (Chrome, Firefox, Safari, Brave, Edge)
* Experiencia consistente en desktop y móvil
* Scroll vertical para mejor legibilidad

### 📖 Sistema de Estanterías

* **Crear estanterías personalizadas** con nombre y descripción
* **Agregar libros** a múltiples estanterías
* **Visualización organizada** de colecciones
* **Gestión completa:** editar, eliminar y compartir estanterías
* **Vista de estantería individual** con todos sus libros
* Sincronización en tiempo real con el backend
* Comunicación con endpoints `/bookshelves`.

### 📊 Progreso de Lectura

* **Registro automático** de la página actual al leer
* **Guardado manual** con indicador de página pre-rellenado
* **Visualización de progreso** por libro en las tarjetas
* **Historial de lectura** sincronizado
* **Continuar desde donde lo dejaste** con detección automática
* Porcentaje de avance calculado dinámicamente
* Integrado con endpoints `/reading-progress`.

### 👤 Gestión de Perfil

* Ver y actualizar información personal
* Avatar con iniciales del usuario
* Indicador de rol (Administrador/Usuario)
* Gestión de favoritos
* Acceso rápido al panel de administración (para admins)

## 💡 Tecnologías Utilizadas

### Frontend
* **React 18** - Biblioteca de UI
* **TypeScript** - Tipado estático
* **Vite** - Build tool ultra-rápido
* **React Router DOM** - Enrutamiento
* **React-PDF** - Visualización de PDFs
* **PDF.js** - Motor de renderizado PDF

### Deployment
* **Netlify** - Hosting y CDN
* **Netlify Redirects** - Proxy para manejo de CORS

### APIs & Servicios
* **SoliBooks API** - Backend REST
* **Google Cloud Storage** - Almacenamiento de PDFs y portadas

## 🎨 Características de UI/UX

* **Diseño responsivo** para móviles, tablets y desktop
* **Tema personalizado** con paleta de colores cálidos
* **Navegación intuitiva** con header sticky
* **Modales y overlays** para acciones importantes
* **Sistema de notificaciones toast** para feedback al usuario
* **Animaciones suaves** con transiciones CSS
* **Accesibilidad** con etiquetas ARIA y navegación por teclado
* **Carga optimizada** con lazy loading de componentes

## 🔒 Seguridad

* Autenticación basada en **JWT tokens**
* Refresh tokens automáticos (configurable)
* Validación de formularios en cliente y servidor
* Protección de rutas administrativas
* Sanitización de datos de usuario
* Manejo seguro de credenciales