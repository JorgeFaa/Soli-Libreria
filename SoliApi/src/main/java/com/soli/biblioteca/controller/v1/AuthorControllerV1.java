package com.soli.biblioteca.controller.v1;

import com.soli.biblioteca.Dto.AuthorResponseDTO;
import com.soli.biblioteca.mapper.AuthorMapper;
import com.soli.biblioteca.service.AuthorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V1_PREFIX;

@RestController
@RequestMapping(API_V1_PREFIX + "/authors")
@Tag(name = "Author Management V1", description = "API v1 para gestión de autores - Funcionalidad básica")
public class AuthorControllerV1 {

    private final AuthorService authorService;

    public AuthorControllerV1(AuthorService authorService) {
        this.authorService = authorService;
    }

    @Operation(
            summary = "Obtener todos los autores V1",
            description = "Devuelve una lista simple de todos los autores",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de autores obtenida exitosamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthorResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/all")
    public ResponseEntity<List<AuthorResponseDTO>> getAllAuthors() {
        List<AuthorResponseDTO> authors = authorService.findAll()
                .stream()
                .map(AuthorMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(authors);
    }
}