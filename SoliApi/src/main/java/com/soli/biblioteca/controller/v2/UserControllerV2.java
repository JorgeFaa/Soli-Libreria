package com.soli.biblioteca.controller.v2;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.service.UserService;
import com.soli.biblioteca.service.CognitoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.cognitoidentityprovider.model.CognitoIdentityProviderException;

import java.util.Map;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V2_PREFIX;

@RestController
@RequestMapping(API_V2_PREFIX + "/user")
@Tag(name = "User Management V2", description = "API v2 para gestión de usuarios - Con validaciones mejoradas y funcionalidades adicionales")
@Validated
public class UserControllerV2 {

    private final CognitoService cognitoService;
    private final UserService userService;

    public UserControllerV2(CognitoService cognitoService, UserService userService) {
        this.cognitoService = cognitoService;
        this.userService = userService;
    }

    // ========== ENDPOINTS BÁSICOS MEJORADOS ==========

    @Operation(
            summary = "Registro de usuario V2", 
            description = "Registro mejorado con validaciones adicionales y mejores mensajes de error",
            security = @SecurityRequirement(name = "none")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario registrado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "El usuario ya existe", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterDTO dto) {
        try {
            cognitoService.registerUser(dto.getUsername(), dto.getPassword());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Usuario registrado exitosamente en Cognito",
                "instructions", "Revisa tu email para confirmar la cuenta",
                "nextStep", "verify-account"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            String errorMessage = e.getMessage();
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "REGISTRATION_FAILED",
                "message", errorMessage.contains("UsernameExistsException") ? "El usuario ya existe" : 
                          errorMessage.contains("InvalidPasswordException") ? "Contraseña no cumple requisitos de seguridad" :
                          "Error en el registro: " + errorMessage
            );
            
            HttpStatus status = errorMessage.contains("UsernameExistsException") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(errorResponse);
        }
    }

    @Operation(
            summary = "Login de usuario V2",
            description = "Inicio de sesión mejorado con información adicional del usuario",
            security = @SecurityRequirement(name = "none")
    )
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest dto) {
        Boolean isConfirmed = cognitoService.getUserStatus(dto.getUsername());
        
        if (!isConfirmed) {
            cognitoService.resendConfirmationCode(dto.getUsername());
            Map<String, Object> response = Map.of(
                "success", false,
                "status", "UNCONFIRMED",
                "message", "Cuenta no verificada. Se ha reenviado el código de verificación.",
                "nextStep", "verify-account"
            );
            return ResponseEntity.ok(response);
        }
        
        Map<String, String> tokens = cognitoService.login(dto.getUsername(), dto.getPassword());
        
        // Respuesta mejorada con información adicional
        Map<String, Object> response = Map.of(
            "success", true,
            "tokens", tokens,
            "message", "Inicio de sesión exitoso",
            "userEmail", dto.getUsername(),
            "loginTime", java.time.Instant.now().toString()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Completar registro en BD V2",
            description = "Versión mejorada del registro con validaciones adicionales",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o usuario ya existe", content = @Content),
            @ApiResponse(responseCode = "401", description = "Token JWT inválido", content = @Content)
    })
    @PostMapping("/createUser")
    public ResponseEntity<Map<String, Object>> createUser(@AuthenticationPrincipal Jwt jwt,
                                                          @Valid @RequestBody UserCreateDTO dto) {
        String cognitoSub = jwt.getSubject();
        String userEmail = jwt.getClaim("email");
        
        if (cognitoSub == null || cognitoSub.trim().isEmpty()) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "INVALID_TOKEN",
                "message", "Token JWT no contiene información de usuario válida"
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            UserDTO user = userService.createUserInDB(cognitoSub, dto);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "user", user,
                "message", "Perfil de usuario completado exitosamente",
                "email", userEmail != null ? userEmail : "N/A"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "USER_CREATION_FAILED",
                "message", e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @Operation(
            summary = "Obtener perfil del usuario V2",
            description = "Versión mejorada que incluye información adicional del perfil",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal Jwt jwt) {
        try {
            UserDTO user = userService.findUserByJwt(jwt);
            String userEmail = jwt.getClaim("email");
            String username = jwt.getClaim("cognito:username");
            
            Map<String, Object> response = Map.of(
                "success", true,
                "user", user,
                "accountInfo", Map.of(
                    "email", userEmail != null ? userEmail : "N/A",
                    "username", username != null ? username : "N/A",
                    "cognitoSub", jwt.getSubject()
                ),
                "message", "Perfil obtenido exitosamente"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "USER_NOT_FOUND",
                "message", "Usuario no ha completado el registro en la base de datos",
                "nextStep", "createUser"
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }



    @Operation(
            summary = "Información del perfil completo V2",
            description = "Obtiene información completa del usuario incluyendo estadísticas",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/profile/complete")
    public ResponseEntity<?> getCompleteProfile(@AuthenticationPrincipal Jwt jwt) {
        try {
            // Obtenemos usuario usando el ID interno de tu DB
            UserDTO user = userService.findUserByJwt(jwt); // Esto devuelve tu DTO con ID interno
            String userEmail = jwt.getClaim("email");

            UserResponseDTO responseDto = new UserResponseDTO();
            responseDto.setId(user.getId()); // ID interno
            responseDto.setFirstName(user.getFirstName());
            responseDto.setLastName(user.getLastName());
            responseDto.setEmail(userEmail != null ? userEmail : "N/A");
            responseDto.setPreferredGenreIds(user.getPrefferredGenreIds());
            responseDto.setFavoriteBooks(user.getFavoriteBooks());

            Map<String, Object> response = Map.of(
                    "success", true,
                    "profile", responseDto,
                    "message", "Perfil completo obtenido exitosamente"
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                    "success", false,
                    "error", "PROFILE_NOT_COMPLETE",
                    "message", e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }


    // ========== ENDPOINTS DE AUTENTICACIÓN MEJORADOS ==========

    @Operation(
            summary = "Refrescar token V2",
            description = "Versión mejorada del refresh con información adicional",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @PostMapping("/auth/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO dto) {
        try {
            Map<String, String> tokens = cognitoService.refreshToken(dto.getUsername(), dto.getRefreshToken());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "tokens", tokens,
                "message", "Tokens renovados exitosamente",
                "refreshTime", java.time.Instant.now().toString()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "TOKEN_REFRESH_FAILED",
                "message", "Error al renovar tokens: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @Operation(
            summary = "Cerrar sesión V2",
            description = "Logout mejorado con confirmación detallada",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, Object>> logout(@Valid @RequestBody RefreshTokenRequestDTO dto) {
        try {
            cognitoService.revokeRefreshToken(dto.getUsername(), dto.getRefreshToken());
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Sesión cerrada exitosamente",
                "username", dto.getUsername(),
                "logoutTime", java.time.Instant.now().toString()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            // Mantener idempotencia pero con mejor mensaje
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Sesión cerrada (idempotente)",
                "note", "La sesión ya estaba cerrada o el token era inválido"
            );
            return ResponseEntity.ok(response);
        }
    }

    @Operation(
            summary = "Cerrar todas las sesiones V2",
            description = "Logout global mejorado con información detallada",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @PostMapping("/auth/logout-all")
    public ResponseEntity<Map<String, Object>> logoutAll(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("cognito:username");
        if (username == null) {
            username = jwt.getClaim("username");
        }
        
        if (username == null) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "INVALID_TOKEN",
                "message", "No se pudo obtener el nombre de usuario del token JWT"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        try {
            cognitoService.globalSignOut(username);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Todas las sesiones cerradas exitosamente",
                "username", username,
                "globalLogoutTime", java.time.Instant.now().toString(),
                "note", "Todos los dispositivos han sido desconectados"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "GLOBAL_LOGOUT_FAILED",
                "message", "Error al cerrar todas las sesiones: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== ENDPOINTS HEREDADOS (compatibilidad) ==========

    @PostMapping("/verify-account")
    public ResponseEntity<Map<String, String>> verifyAccount(@Valid @RequestBody ConfirmAccountRequest dto) {
        try {
            boolean verified = cognitoService.confirmSignUp(dto.getUsername(), dto.getCode());
            if (verified) {
                return ResponseEntity.ok(Map.of("status", "SUCCESS"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "INVALID_CODE"));
            }
        } catch (CognitoIdentityProviderException e) {
            if (e.awsErrorDetails().errorCode().equals("ExpiredCodeException")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "CODE_EXPIRED"));
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", "ERROR"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@Valid @RequestBody VerificationRequest dto) {
        cognitoService.resendConfirmationCode(dto.getUsername());
        return ResponseEntity.ok("Código de verificación reenviado");
    }

}