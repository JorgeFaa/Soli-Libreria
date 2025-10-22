package com.soli.biblioteca.controller.v1;

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
import jakarta.validation.constraints.Email;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.cognitoidentityprovider.model.CognitoIdentityProviderException;

import java.util.Map;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V1_PREFIX;

@RestController
@RequestMapping(API_V1_PREFIX + "/user")
@Tag(name = "User Management V1", description = "API v1 para gestión de usuarios - Compatible con frontend actual")
public class UserControllerV1 {

    private final CognitoService cognitoService;
    private final UserService userService;

    public UserControllerV1(CognitoService cognitoService, UserService userService) {
        this.cognitoService = cognitoService;
        this.userService = userService;
    }

    // 1. Registrar usuario en Cognito
    @Operation(summary = "Registro de usuario V1", security = @SecurityRequirement(name = "none"))
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterDTO dto) {
        try {
            // Las validaciones ahora se manejan por Bean Validation y GlobalExceptionHandler
            
            // Intentar registro directo sin verificar existencia previa
            cognitoService.registerUser(dto.getUsername(), dto.getPassword());
            return ResponseEntity.ok("Usuario registrado en Cognito. Revisa tu email para confirmar la cuenta.");
            
        } catch (RuntimeException e) {
            // Manejar errores específicos de Cognito
            String errorMessage = e.getMessage();
            if (errorMessage.contains("UsernameExistsException") || errorMessage.contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El usuario ya existe");
            }
            if (errorMessage.contains("InvalidPasswordException")) {
                return ResponseEntity.badRequest()
                    .body("Password no cumple los requisitos de seguridad");
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error en el registro: " + errorMessage);
        }
    }

    // 2. Iniciar sesión con Cognito
    @Operation(summary = "Login de usuario V1", security = @SecurityRequirement(name = "none"))
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest dto) {
        Boolean status = cognitoService.getUserStatus(dto.getUsername());
        if (status == false) {
            // Redirigir al flujo de confirmación de correo
            cognitoService.resendConfirmationCode(dto.getUsername());
            return ResponseEntity.ok(Map.of("status","UNCONFIRMED"));
        }
        Map<String, String> tokens = cognitoService.login(dto.getUsername(), dto.getPassword());
        // No crear usuario en BD todavía
        return ResponseEntity.ok(tokens);
    }

    @Operation(
            summary = "Completar registro en base de datos V1",
            description = "Crea el perfil del usuario en la base de datos local usando los datos del JWT de Cognito",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o usuario ya existe", content = @Content),
            @ApiResponse(responseCode = "401", description = "Token JWT inválido o expirado", content = @Content)
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

    // 4. Obtener usuario por cognitoSub
    @Operation(summary = "Obtener usuario por cognitoSub V1", security = { @SecurityRequirement(name = "bearerAuth") })
    @GetMapping("/{cognitoSub}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getBySub(@PathVariable String cognitoSub) {
        UserDTO user = userService.findByCognitoSubDTO(cognitoSub);
        return ResponseEntity.ok(user);
    }

    // 5. Obtener usuario logueado (usando JWT)
    @Operation(
            summary = "Obtener perfil del usuario logueado V1",
            description = "Obtiene la información completa del usuario actualmente autenticado usando su JWT",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario encontrado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Usuario no ha completado el registro en BD", content = @Content),
            @ApiResponse(responseCode = "401", description = "Token JWT inválido o expirado", content = @Content)
    })
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal Jwt jwt) {
        UserDTO user = userService.findUserByJwt(jwt);
        return ResponseEntity.ok(user);
    }


    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@Valid @RequestBody VerificationRequest dto) {
        cognitoService.resendConfirmationCode(dto.getUsername());
        return ResponseEntity.ok("Código de verificación reenviado");
    }

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
                // informar al usuario que el código expiró
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("status", "CODE_EXPIRED"));
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", "ERROR"));
    }

    @PostMapping("/auth/refresh-token")
    public ResponseEntity<Map<String, String>> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO dto){
        Map<String, String> tokens = cognitoService.refreshToken(dto.getUsername(), dto.getRefreshToken());
        return ResponseEntity.ok(tokens);
    }

    // Cerrar sesión del dispositivo actual (revocar refresh token)
    @Operation(
            summary = "Cerrar sesión V1 (revocar refresh token)",
            description = "Revoca el refresh token del dispositivo actual en Cognito. Requiere body: { username, refreshToken }.",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logout exitoso"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno", content = @Content)
    })
    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, String>> logout(@Valid @RequestBody RefreshTokenRequestDTO dto) {
        try {
            cognitoService.revokeRefreshToken(dto.getUsername(), dto.getRefreshToken());
        } catch (RuntimeException e) {
            // no exponer detalles; mantener idempotencia
        }
        return ResponseEntity.ok(Map.of("ok", "true"));
    }

    // Cerrar sesión global (todas las sesiones del usuario)
    @Operation(
            summary = "Cerrar sesión global V1 (todas las sesiones)",
            description = "Invalida todos los refresh tokens del usuario autenticado en el User Pool. El username se toma del claim cognito:username del JWT.",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logout global exitoso"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno", content = @Content)
    })
    @PostMapping("/auth/logout-all")
    public ResponseEntity<Map<String, String>> logoutAll(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("cognito:username");
        if (username == null) {
            username = jwt.getClaim("username");
        }
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("status", "UNAUTHORIZED"));
        }
        try {
            cognitoService.globalSignOut(username);
            return ResponseEntity.ok(Map.of("ok", "true"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "ERROR"));
        }
    }

    @Operation(
            summary = "Verificar estado de confirmación de usuario V1",
            description = "Verifica si un usuario ha confirmado su cuenta en Cognito",
            security = @SecurityRequirement(name = "none")
    )
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getUserStatus(
            @RequestParam("username") @Email(message = "El formato del email no es válido") String username) {
        try {
            boolean confirmed = cognitoService.getUserStatus(username);
            return ResponseEntity.ok(Map.of("isConfirmed", confirmed));
        } catch (CognitoIdentityProviderException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("isConfirmed", false));
        }
    }
}