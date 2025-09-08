package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.service.UserService;
import com.soli.biblioteca.service.CognitoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

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
        cognitoService.registerUser(dto.getUsername(), dto.getPassword());
        return ResponseEntity.ok("Registrado en Cognito");
    }

    // 2. Iniciar sesión con Cognito
    @Operation(summary = "Login de usuario", security = @SecurityRequirement(name = "none"))
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest dto) {
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
    @GetMapping("/user/{cognitoSub}")
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

    // 6. Patch genrePreference por id o cognitoSub
    @Operation(summary = "cambiar preferencia de genero por id", security = { @SecurityRequirement(name = "bearerAuth") })
    @PatchMapping("/{identifier}/genre")
    public ResponseEntity<UserDTO> patchGenre(
            @PathVariable String identifier, @RequestBody Map<String, String> body) {

        String newGenre = body.get("genrePreference");
        UserDTO dto = identifier.matches("\\d+")
                ? userService.updateGenreById(Long.valueOf(identifier), newGenre)
                : userService.updateGenreBySub(identifier, newGenre);

        return ResponseEntity.ok(dto);
    }

    // 7. Cambiar rol
    @Operation(summary = "Cambiar rol de usuario", security = { @SecurityRequirement(name = "bearerAuth") })
    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> changeRole(
            @PathVariable Long id, @RequestBody Map<String,String> body, @AuthenticationPrincipal Jwt jwt) {
        userService.checkAdmin(jwt.getSubject());
        return ResponseEntity.ok(userService.updateRole(id, body.get("roleName")));
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
    public ResponseEntity<String> verifyAccount(@RequestBody ConfirmAccountRequest dto) {
        boolean verified = cognitoService.confirmSignUp(dto.getUsername(), dto.getCode());
        if (verified) {
            return ResponseEntity.ok("Cuenta verificada correctamente");
        } else {
            return ResponseEntity.badRequest().body("Código inválido o expirado");
        }
    }
}


