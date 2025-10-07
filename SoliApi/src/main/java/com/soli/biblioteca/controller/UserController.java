package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.service.UserService;
import com.soli.biblioteca.service.CognitoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.cognitoidentityprovider.model.CognitoIdentityProviderException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserNotFoundException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserStatusType;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    private final CognitoService cognitoService;
    private final UserService userService;


    public UserController(CognitoService cognitoService, UserService userService) {
        this.cognitoService = cognitoService;
        this.userService = userService;
    }

    // 1. Registrar usuario en Cognito
    @Operation(summary = "Registro de usuario", security = @SecurityRequirement(name = "none"))
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDTO dto) {
        try {
            // Validación básica
            if (dto.getUsername() == null || dto.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username es requerido");
            }
            if (dto.getPassword() == null || dto.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Password debe tener al menos 6 caracteres");
            }

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
    @Operation(summary = "Login de usuario", security = @SecurityRequirement(name = "none"))
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest dto) {
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

    @Operation(summary = "Completar registro en base de datos", security = { @SecurityRequirement(name = "bearerAuth") })
    @PostMapping("/createUser")
    public ResponseEntity<UserDTO> createUser(@AuthenticationPrincipal Jwt jwt,
                                                        @RequestBody UserCreateDTO dto) {
        // jwt.getSubject() puede contener el sub de Cognito
        UserDTO user = userService.createUserInDB(jwt.getSubject(), dto);
        return ResponseEntity.ok(user);
    }

    // 4. Obtener usuario por cognitoSub
    @Operation(summary = "Obtener usuario por cognitoSub", security = { @SecurityRequirement(name = "bearerAuth") })
    @GetMapping("/{cognitoSub}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getBySub(@PathVariable String cognitoSub) {
        UserDTO user = userService.findByCognitoSubDTO(cognitoSub);
        return ResponseEntity.ok(user);
    }

    // 5. Obtener usuario logueado (usando JWT)
    @Operation(summary = "Obtener usuario logueado", security = { @SecurityRequirement(name = "bearerAuth") })
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.findUserByJwt(jwt));
    }



    // =======================================
    // Activar membresía (backend)
    // =======================================
    @Operation(summary = "Activar membresia", security = { @SecurityRequirement(name = "bearerAuth") })
    @PatchMapping("/{id}/active")
    public ResponseEntity<UserDTO> activateMembership(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateMembership(id));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestBody VerificationRequest dto) {
        cognitoService.resendConfirmationCode(dto.getUsername());
        return ResponseEntity.ok("Código de verificación reenviado");
    }

    @PostMapping("/verify-account")
    public ResponseEntity<Map<String, String>> verifyAccount(@RequestBody ConfirmAccountRequest dto) {
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
    public ResponseEntity<Map<String, String>> refreshToken(@RequestBody RefreshTokenRequestDTO dto){
        Map<String, String> tokens = cognitoService.refreshToken(dto.getUsername(), dto.getRefreshToken());
        return ResponseEntity.ok(tokens);
    }


    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getUserStatus(@RequestBody String username) {
        try {
            boolean confirmed = cognitoService.getUserStatus(username);
            return ResponseEntity.ok(Map.of("isConfirmed", confirmed));
        } catch (CognitoIdentityProviderException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("isConfirmed", false));
        }
    }

}


