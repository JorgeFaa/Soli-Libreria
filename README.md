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