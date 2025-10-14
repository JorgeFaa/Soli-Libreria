package com.soli.biblioteca.controller.v2;

import com.soli.biblioteca.Dto.GenreResponseDTO;
import com.soli.biblioteca.mapper.GenreMapper;
import com.soli.biblioteca.service.GenreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V2_PREFIX;

@RestController
@RequestMapping(API_V2_PREFIX + "/genres")
@Tag(name = "Genre Management V2", description = "API v2 para gestión de géneros - Con búsqueda avanzada por nombre")
public class GenreControllerV2 {

    private final GenreService genreService;

    public GenreControllerV2(GenreService genreService) {
        this.genreService = genreService;
    }

    @Operation(
            summary = "Búsqueda avanzada de géneros V2",
            description = "Buscar géneros por nombre con filtrado inteligente. Si no se proporciona filtro, devuelve todos los géneros."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Búsqueda exitosa",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = GenreResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<GenreResponseDTO>> searchGenres(
            @Parameter(description = "Filtrar por nombre del género (búsqueda parcial)")
            @RequestParam(required = false) String name
    ) {
        List<GenreResponseDTO> genres = genreService.findByNameFilter(name)
                .stream()
                .map(GenreMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(genres);
    }

    @Operation(
            summary = "Obtener todos los géneros V2",
            description = "Lista completa de todos los géneros disponibles",
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

    @Operation(
            summary = "Buscar géneros por nombre V2",
            description = "Búsqueda específica por nombre del género con coincidencia parcial",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/search/name")
    public ResponseEntity<List<GenreResponseDTO>> searchByName(
            @Parameter(description = "Nombre a buscar (búsqueda parcial)")
            @RequestParam String name
    ) {
        List<GenreResponseDTO> genres = genreService.findByNameContaining(name)
                .stream()
                .map(GenreMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(genres);
    }

    @Operation(
            summary = "Géneros populares V2",
            description = "Obtiene los géneros más populares (simulado para V2)",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/popular")
    public ResponseEntity<List<GenreResponseDTO>> getPopularGenres(
            @Parameter(description = "Límite de resultados")
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<GenreResponseDTO> genres = genreService.findAll()
                .stream()
                .limit(limit)
                .map(GenreMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(genres);
    }

    @Operation(
            summary = "Estadísticas de géneros V2",
            description = "Obtiene estadísticas básicas de los géneros (total, etc.)",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getGenreStats() {
        List<GenreResponseDTO> allGenres = genreService.findAll()
                .stream()
                .map(GenreMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalGenres", allGenres.size());
        stats.put("message", "Estadísticas básicas de géneros V2");
        
        return ResponseEntity.ok(stats);
    }
}