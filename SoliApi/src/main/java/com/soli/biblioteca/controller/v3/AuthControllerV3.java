package com.soli.biblioteca.controller.v3;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.exception.AccountNotVerifiedException;
import com.soli.biblioteca.service.CognitoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V3_PREFIX;

@RestController
@RequestMapping(API_V3_PREFIX + "/auth")
@Tag(name = "Authentication V3", description = "API v3 para la gestión de autenticación y autorización")
public class AuthControllerV3 {

    private final CognitoService cognitoService;

    public AuthControllerV3(CognitoService cognitoService) {
        this.cognitoService = cognitoService;
    }

    @Operation(summary = "Registro de usuario V3")
    @PostMapping("/register")
    public ResponseEntity<SuccessResponseDTO> register(@Valid @RequestBody RegisterDTO dto) {
        cognitoService.registerUser(dto.getUsername(), dto.getPassword());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Usuario registrado exitosamente. Por favor, verifica tu cuenta."));
    }

    @Operation(summary = "Login de usuario V3")
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequest dto) {
        if (!cognitoService.isUserConfirmed(dto.getUsername())) {
            cognitoService.resendConfirmationCode(dto.getUsername());
            throw new AccountNotVerifiedException("La cuenta no ha sido verificada. Se ha reenviado un nuevo código de confirmación.", "/verify-account");
        }
        return ResponseEntity.ok(cognitoService.login(dto.getUsername(), dto.getPassword()));
    }

    @Operation(summary = "Refrescar token V3")
    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponseDTO> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO dto) {
        return ResponseEntity.ok(cognitoService.refreshToken(dto.getUsername(), dto.getRefreshToken()));
    }

    @Operation(summary = "Cerrar sesión V3", security = { @SecurityRequirement(name = "bearerAuth") })
    @PostMapping("/logout")
    public ResponseEntity<SuccessResponseDTO> logout(@Valid @RequestBody RefreshTokenRequestDTO dto) {
        cognitoService.revokeRefreshToken(dto.getUsername(), dto.getRefreshToken());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Sesión cerrada exitosamente."));
    }

    @Operation(summary = "Cerrar todas las sesiones V3", security = { @SecurityRequirement(name = "bearerAuth") })
    @PostMapping("/logout-all")
    public ResponseEntity<SuccessResponseDTO> logoutAll(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaim("cognito:username");
        if (username == null) {
            username = jwt.getClaim("username");
        }
        cognitoService.globalSignOut(username);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Todas las sesiones han sido cerradas exitosamente."));
    }

    @Operation(summary = "Verificar cuenta V3")
    @PostMapping("/verify-account")
    public ResponseEntity<SuccessResponseDTO> verifyAccount(@Valid @RequestBody ConfirmAccountRequest dto) {
        cognitoService.confirmSignUp(dto.getUsername(), dto.getCode());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Cuenta verificada exitosamente."));
    }

    @Operation(summary = "Reenviar código de verificación V3")
    @PostMapping("/resend-verification")
    public ResponseEntity<SuccessResponseDTO> resendVerification(@Valid @RequestBody VerificationRequest dto) {
        cognitoService.resendConfirmationCode(dto.getUsername());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Código de verificación reenviado exitosamente."));
    }
}
