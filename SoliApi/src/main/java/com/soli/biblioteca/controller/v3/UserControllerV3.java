package com.soli.biblioteca.controller.v3;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V3_PREFIX;

@RestController
@RequestMapping(API_V3_PREFIX + "/users")
@Tag(name = "User Management V3", description = "API v3 para la gestión de perfiles de usuario")
@SecurityRequirement(name = "bearerAuth")
public class UserControllerV3 {

    private final UserService userService;

    public UserControllerV3(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Completar el perfil de usuario en la base de datos")
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UserCreateDTO userCreateDTO) {
        String cognitoSub = jwt.getSubject();
        UserDTO createdUser = userService.createUserInDB(cognitoSub, userCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @Operation(summary = "Obtener el perfil del usuario autenticado")
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        UserDTO user = userService.findUserByJwt(jwt);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Actualizar el perfil del usuario autenticado (parcial)")
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateUserProfile(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        String cognitoSub = jwt.getSubject();
        UserDTO updatedUser = userService.updateUserProfile(cognitoSub, userUpdateDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // ========== Gestión de Libros Favoritos ==========

    @Operation(summary = "Obtener los libros favoritos del usuario autenticado")
    @GetMapping("/me/favorites")
    public ResponseEntity<Set<BookResponseDTO>> getFavoriteBooks(@AuthenticationPrincipal Jwt jwt) {
        String cognitoSub = jwt.getSubject();
        return ResponseEntity.ok(userService.getFavoriteBooks(cognitoSub));
    }

    @Operation(summary = "Añadir un libro a favoritos")
    @PostMapping("/me/favorites/{bookId}")
    public ResponseEntity<Void> addFavoriteBook(@AuthenticationPrincipal Jwt jwt, @PathVariable Long bookId) {
        String cognitoSub = jwt.getSubject();
        userService.addFavoriteBook(cognitoSub, bookId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar un libro de favoritos")
    @DeleteMapping("/me/favorites/{bookId}")
    public ResponseEntity<Void> removeFavoriteBook(@AuthenticationPrincipal Jwt jwt, @PathVariable Long bookId) {
        String cognitoSub = jwt.getSubject();
        userService.removeFavoriteBook(cognitoSub, bookId);
        return ResponseEntity.noContent().build();
    }

    // ========== Gestión de Progreso de Lectura ==========

    @Operation(summary = "Obtener todo el progreso de lectura del usuario")
    @GetMapping("/me/progress")
    public ResponseEntity<List<ReadingProgressDTO>> getReadingProgress(@AuthenticationPrincipal Jwt jwt) {
        String cognitoSub = jwt.getSubject();
        return ResponseEntity.ok(userService.getReadingProgress(cognitoSub));
    }

    @Operation(summary = "Guardar o actualizar el progreso de lectura para un libro")
    @PutMapping("/me/progress/{bookId}")
    public ResponseEntity<ReadingProgressDTO> saveOrUpdateReadingProgress(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long bookId,
            @Valid @RequestBody ReadingProgressUpdateDTO readingProgressUpdateDTO) {
        String cognitoSub = jwt.getSubject();
        ReadingProgressDTO updatedProgress = userService.saveOrUpdateReadingProgress(cognitoSub, bookId, readingProgressUpdateDTO);
        return ResponseEntity.ok(updatedProgress);
    }
}
