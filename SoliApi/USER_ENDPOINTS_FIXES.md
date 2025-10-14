# 🔧 Corrección de Errores en Endpoints de Usuario

## 📋 Resumen de la Revisión

He revisado los endpoints de creación de usuario en BD y obtención de usuario logueado, encontrando **6 problemas críticos** que fueron corregidos.

---

## 🚨 **PROBLEMAS IDENTIFICADOS Y SOLUCIONADOS**

### **Endpoint: POST /user/createUser**

#### ❌ **Problema 1: Campo activeMember Ignorado**

**ANTES (INCORRECTO):**
```java
// ❌ Siempre hardcodeado a false, ignorando el DTO
boolean active = false; // mantener comportamiento actual
userRepository.createUserByProcedure(
    dto.getFirstName(),
    dto.getLastName(),
    active,  // ← Siempre false!
    cognitoSub
);
```

**DESPUÉS (CORREGIDO):**
```java
// ✅ Usa el valor del DTO o false por defecto
boolean active = dto.getActiveMember() != null ? dto.getActiveMember() : false;
log.debug("Creating user with activeMember: {}", active);

userRepository.createUserByProcedure(
    dto.getFirstName(),
    dto.getLastName(),
    active,  // ← Ahora usa el valor correcto
    cognitoSub
);
```

#### ❌ **Problema 2: Inconsistencia entre Stored Procedure y JPA Fallback**

**ANTES (INCORRECTO):**
```java
// ❌ JPA fallback también ignoraba el DTO
user.setActiveMember(false); // Hardcodeado
```

**DESPUÉS (CORREGIDO):**
```java
// ✅ Consistencia entre SP y JPA
boolean active = dto.getActiveMember() != null ? dto.getActiveMember() : false;
user.setActiveMember(active);
log.debug("JPA fallback: setting activeMember to {}", active);
```

#### ❌ **Problema 3: Naming Inconsistente en DTO**

**ANTES (INCORRECTO):**
```java
// ❌ PascalCase en Java (incorrecto)
private Set<Long> PreferredGenreIds;
```

**DESPUÉS (CORREGIDO):**
```java
// ✅ camelCase estándar de Java
private Set<Long> preferredGenreIds;
```

#### ❌ **Problema 4: Manejo de Errores Incompleto**

**ANTES (BÁSICO):**
```java
@PostMapping("/createUser")
public ResponseEntity<UserDTO> createUser(@AuthenticationPrincipal Jwt jwt,
                                        @Valid @RequestBody UserCreateDTO dto) {
    // jwt.getSubject() puede contener el sub de Cognito
    UserDTO user = userService.createUserInDB(jwt.getSubject(), dto);
    return ResponseEntity.ok(user);
}
```

**DESPUÉS (ROBUSTO):**
```java
@Operation(
    summary = "Completar registro en base de datos",
    description = "Crea el perfil del usuario en la base de datos local usando los datos del JWT de Cognito",
    security = { @SecurityRequirement(name = "bearerAuth") }
)
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente"),
    @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o usuario ya existe"),
    @ApiResponse(responseCode = "401", description = "Token JWT inválido o expirado")
})
@PostMapping("/createUser")
public ResponseEntity<UserDTO> createUser(@AuthenticationPrincipal Jwt jwt,
                                        @Valid @RequestBody UserCreateDTO dto) {
    // Validar que el JWT contiene el subject
    String cognitoSub = jwt.getSubject();
    if (cognitoSub == null || cognitoSub.trim().isEmpty()) {
        return ResponseEntity.badRequest().build();
    }
    
    UserDTO user = userService.createUserInDB(cognitoSub, dto);
    return ResponseEntity.ok(user);
}
```

---

### **Endpoint: GET /user/me**

#### ❌ **Problema 5: Devolvía null en lugar de Error**

**ANTES (INCORRECTO):**
```java
return userRepository.findByCognitoSub(cognitoSub)
    .map(UserMapper::toDTO)
    .orElse(null); // ❌ Devolvía null = respuesta 200 con body null
```

**DESPUÉS (CORREGIDO):**
```java
return userRepository.findByCognitoSub(cognitoSub)
    .map(user -> {
        UserDTO userDTO = UserMapper.toDTO(user);
        log.debug("User found in DB with ID: {}", userDTO.getId());
        return userDTO;
    })
    .orElseThrow(() -> {
        log.error("User not found for cognitoSub: {}", cognitoSub);
        return new BusinessLogicException(
            "Usuario no encontrado. Debe completar el registro en la base de datos."
        );
    }); // ✅ Lanza excepción = respuesta 400 con mensaje claro
```

#### ❌ **Problema 6: Falta de Logging para Debugging**

**ANTES (SIN LOGS):**
```java
public UserDTO findUserByJwt(Jwt jwt) {
    String cognitoSub = jwt.getSubject(); 
    // ... sin información de debug
}
```

**DESPUÉS (CON LOGGING DETALLADO):**
```java
public UserDTO findUserByJwt(Jwt jwt) {
    String cognitoSub = jwt.getSubject();
    log.debug("Finding user by JWT with cognitoSub: {}", cognitoSub);

    try {
        Optional<Object[]> row = userRepository.findUserViewByCognitoSub(cognitoSub);
        if (row.isPresent()) {
            UserDTO user = mapUserViewRow(row.get());
            log.debug("User found in view with ID: {}", user.getId());
            return user;
        }
    } catch (Exception e) {
        log.warn("Failed to fetch user from view, trying JPA: {}", e.getMessage());
    }
    // ... más logging
}
```

---

## 📊 **COMPARACIÓN ANTES vs DESPUÉS**

### **Flujo de Creación de Usuario**

#### ❌ **ANTES:**
```bash
# Request
POST /user/createUser
{
  "firstName": "Juan",
  "lastName": "Pérez", 
  "activeMember": true,      # ← Se ignora completamente
  "preferredGenreIds": [1,2] # ← Campo mal nombrado
}

# Comportamiento:
# 1. activeMember siempre se pone en false
# 2. No hay validación de JWT subject
# 3. Logging mínimo
```

#### ✅ **DESPUÉS:**
```bash
# Request
POST /user/createUser
{
  "firstName": "Juan",
  "lastName": "Pérez", 
  "activeMember": true,      # ✅ Se respeta el valor
  "preferredGenreIds": [1,2] # ✅ Naming correcto
}

# Comportamiento:
# 1. activeMember se pone según el DTO (true en este caso)
# 2. Validación de JWT subject
# 3. Logging detallado
# 4. Documentación Swagger completa
```

### **Flujo de Obtener Usuario Logueado**

#### ❌ **ANTES:**
```bash
# Request
GET /user/me
Authorization: Bearer <jwt-token>

# Si no existe usuario en BD:
HTTP 200 OK
null  # ← Respuesta confusa
```

#### ✅ **DESPUÉS:**
```bash
# Request  
GET /user/me
Authorization: Bearer <jwt-token>

# Si no existe usuario en BD:
HTTP 400 Bad Request
{
  "timestamp": "2024-10-14T04:46:34",
  "status": 400,
  "error": "Business Logic Error",
  "message": "Usuario no encontrado. Debe completar el registro en la base de datos.",
  "path": "/user/me"
}
```

---

## 🎯 **BENEFICIOS DE LAS CORRECCIONES**

### **1. Funcionalidad Correcta**
- ✅ El campo `activeMember` ahora funciona correctamente
- ✅ Consistencia entre stored procedure y JPA fallback
- ✅ Naming conventions de Java respetadas

### **2. Mejor Experiencia de Usuario**
- ✅ Mensajes de error claros y útiles
- ✅ Códigos HTTP apropiados
- ✅ Respuestas consistentes

### **3. Debugging Mejorado**
- ✅ Logging detallado en cada paso
- ✅ Información contextual en los logs
- ✅ Diferenciación entre errores de vista y JPA

### **4. Documentación Profesional**
- ✅ Swagger documentation completa
- ✅ Descripciones claras de endpoints
- ✅ Códigos de respuesta documentados

### **5. Robustez**
- ✅ Validaciones adicionales de entrada
- ✅ Manejo apropiado de casos edge
- ✅ Excepciones específicas de negocio

---

## 🧪 **Casos de Prueba**

### **Test 1: Creación de Usuario con activeMember = true**
```bash
curl -X POST http://localhost:8080/user/createUser \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "González", 
    "activeMember": true,
    "preferredGenreIds": [1, 3]
  }'

# Resultado esperado: Usuario creado con activeMember = true
```

### **Test 2: Obtener Usuario No Registrado en BD**
```bash
curl -X GET http://localhost:8080/user/me \
  -H "Authorization: Bearer <jwt-token-sin-usuario-en-bd>"

# Resultado esperado: HTTP 400 con mensaje explicativo
```

### **Test 3: Crear Usuario Duplicado**
```bash
curl -X POST http://localhost:8080/user/createUser \
  -H "Authorization: Bearer <jwt-token-ya-registrado>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez", 
    "activeMember": false
  }'

# Resultado esperado: HTTP 400 "El usuario ya existe en la base de datos"
```

---

## 📈 **Impacto de las Mejoras**

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **Funcionalidad activeMember** | ❌ Siempre false | ✅ Respeta DTO |
| **Manejo de usuarios no encontrados** | ❌ null response | ✅ Error claro |
| **Logging** | ❌ Mínimo | ✅ Detallado |
| **Documentación** | ❌ Básica | ✅ Completa |
| **Validaciones** | ❌ Pocas | ✅ Robustas |
| **Experiencia Developer** | ❌ Confusa | ✅ Clara |

---

## 🚀 **Próximos Pasos Recomendados**

1. **Testing**: Crear tests unitarios para los casos edge
2. **Validación adicional**: Validar que los genreIds existen antes de asignar
3. **Endpoint update**: Crear endpoint PATCH para actualizar datos del usuario
4. **Métricas**: Agregar métricas de éxito/fallo en registro
5. **Rate limiting**: Considerar rate limiting para evitar spam de creación

¡Los endpoints de usuario ahora son **robustos**, **bien documentados** y **fáciles de debuggear**! 🎉