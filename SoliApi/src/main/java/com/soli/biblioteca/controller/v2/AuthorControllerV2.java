package com.soli.biblioteca.controller.v2;

import com.soli.biblioteca.Dto.AuthorResponseDTO;
import com.soli.biblioteca.mapper.AuthorMapper;
import com.soli.biblioteca.service.AuthorService;
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
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.stream.Collectors;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V2_PREFIX;

@RestController
@RequestMapping(API_V2_PREFIX + "/authors")
@Tag(name = "Author Management V2", description = "API v2 para gestión de autores - Búsquedas avanzadas y filtros combinados")
@Validated
public class AuthorControllerV2 {

    private final AuthorService authorService;

    public AuthorControllerV2(AuthorService authorService) {
        this.authorService = authorService;
    }

    @Operation(
            summary = "Búsqueda avanzada de autores V2",
            description = "Buscar autores con filtros múltiples por nombre y país. Soporta filtros combinados para búsquedas precisas."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Búsqueda exitosa",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthorResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<AuthorResponseDTO>> searchAuthors(
            @Parameter(description = "Filtrar por nombre del autor (búsqueda parcial)")
            @RequestParam(required = false)
            @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
            String name,
            
            @Parameter(description = "Filtrar por país del autor (búsqueda parcial)")
            @RequestParam(required = false)
            @Size(min = 2, max = 100, message = "El país debe tener entre 2 y 100 caracteres")
            String country
    ) {
        List<AuthorResponseDTO> authors = authorService.findByFilters(name, country)
                .stream()
                .map(AuthorMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(authors);
    }

    @Operation(
            summary = "Obtener todos los autores V2",
            description = "Lista completa de todos los autores disponibles",
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

    @Operation(
            summary = "Buscar autores por nombre V2",
            description = "Búsqueda específica por nombre del autor con coincidencia parcial",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/search/name")
    public ResponseEntity<List<AuthorResponseDTO>> searchByName(
            @Parameter(description = "Nombre a buscar (búsqueda parcial)")
            @RequestParam
            @NotBlank(message = "El nombre no puede estar vacío")
            @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
            String name
    ) {
        List<AuthorResponseDTO> authors = authorService.findByNameContaining(name)
                .stream()
                .map(AuthorMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(authors);
    }

    @Operation(
            summary = "Buscar autores por país V2",
            description = "Búsqueda específica por país del autor con coincidencia parcial",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/search/country")
    public ResponseEntity<List<AuthorResponseDTO>> searchByCountry(
            @Parameter(description = "País a buscar (búsqueda parcial)")
            @RequestParam
            @NotBlank(message = "El país no puede estar vacío")
            @Size(min = 2, max = 100, message = "El país debe tener entre 2 y 100 caracteres")
            String country
    ) {
        List<AuthorResponseDTO> authors = authorService.findByCountryName(country)
                .stream()
                .map(AuthorMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(authors);
    }

    @Operation(
            summary = "Estadísticas de autores V2",
            description = "Obtiene estadísticas básicas de los autores (total, por país, etc.)",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getAuthorStats() {
        List<AuthorResponseDTO> allAuthors = authorService.findAll()
                .stream()
                .map(AuthorMapper::toResponseDTO)
                .collect(Collectors.toList());
        
        // Estadísticas básicas
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalAuthors", allAuthors.size());
        stats.put("message", "Estadísticas básicas de autores V2");
        
        // Contar países únicos
        long uniqueCountries = allAuthors.stream()
                .map(AuthorResponseDTO::getCountryName)
                .filter(country -> country != null)
                .distinct()
                .count();
        stats.put("uniqueCountries", uniqueCountries);
        
        return ResponseEntity.ok(stats);
    }
}