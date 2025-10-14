package com.soli.biblioteca.controller.v1;

import com.soli.biblioteca.Dto.GenreResponseDTO;
import com.soli.biblioteca.mapper.GenreMapper;
import com.soli.biblioteca.service.GenreService;
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
@RequestMapping(API_V1_PREFIX + "/genres")
@Tag(name = "Genre Management V1", description = "API v1 para gestión de géneros - Funcionalidad básica")
public class GenreControllerV1 {

    private final GenreService genreService;

    public GenreControllerV1(GenreService genreService) {
        this.genreService = genreService;
    }

    @Operation(
            summary = "Obtener todos los géneros V1",
            description = "Devuelve una lista simple de todos los géneros",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de géneros obtenida exitosamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = GenreResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/all")
    public ResponseEntity<List<GenreResponseDTO>> getAllGenres() {
        List<GenreResponseDTO> genres = genreService.findAll()
                .stream()
                .map(GenreMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(genres);
    }
}