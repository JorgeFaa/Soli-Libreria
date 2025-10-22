package com.soli.biblioteca.controller.v2;

import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.Dto.BookFilterDTO;
import com.soli.biblioteca.Dto.PagedResponseDTO;
import com.soli.biblioteca.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V2_PREFIX;

@RestController
@RequestMapping(API_V2_PREFIX + "/books")
@Tag(name = "Book Management V2", description = "API v2 para gestión de libros - Con paginación avanzada y filtros múltiples")
@Validated
public class BookControllerV2 {

    private final BookService bookService;

    public BookControllerV2(BookService bookService) {
        this.bookService = bookService;
    }

    @Operation(
            summary = "Búsqueda avanzada de libros V2",
            description = "Buscar libros con paginación y filtros múltiples. Soporta búsqueda por texto, filtros por género, autor, fecha de publicación, etc. Incluye metadata de paginación."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Búsqueda exitosa",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PagedResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Parámetros de búsqueda inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<PagedResponseDTO<BookResponseDTO>> searchBooks(
            @Parameter(description = "Texto de búsqueda en título, descripción o ISBN")
            @RequestParam(required = false) String search,
            
            @Parameter(description = "Filtrar por título específico")
            @RequestParam(required = false) String title,
            
            @Parameter(description = "Filtrar por géneros (IDs separados por coma)")
            @RequestParam(required = false) List<Long> genreIds,
            
            @Parameter(description = "Filtrar por nombre del autor")
            @RequestParam(required = false) String authorName,
            
            @Parameter(description = "Filtrar por editoriales (IDs separados por coma)")
            @RequestParam(required = false) List<Long> editorialIds,
            
            @Parameter(description = "Filtrar por tipo de texto")
            @RequestParam(required = false) Long typeId,
            
            @Parameter(description = "Filtrar libros publicados después de esta fecha (YYYY-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate publishedAfter,
            
            @Parameter(description = "Filtrar libros publicados antes de esta fecha (YYYY-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate publishedBefore,
            
            @Parameter(description = "Número de página (empezando en 0)")
            @RequestParam(defaultValue = "0") @Min(0) int page,
            
            @Parameter(description = "Tamaño de página (máximo 100)")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            
            @Parameter(description = "Campo para ordenar (title, publishedDate, id)")
            @RequestParam(defaultValue = "title") 
            @Pattern(regexp = "^(title|publishedDate|id)$", message = "sortBy debe ser: title, publishedDate o id")
            String sortBy,
            
            @Parameter(description = "Dirección del ordenamiento (ASC, DESC)")
            @RequestParam(defaultValue = "ASC")
            @Pattern(regexp = "^(ASC|DESC)$", message = "sortDirection debe ser ASC o DESC", flags = Pattern.Flag.CASE_INSENSITIVE)
            String sortDirection
    ) {
        // Validación de fechas
        if (publishedAfter != null && publishedBefore != null && publishedAfter.isAfter(publishedBefore)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "publishedAfter no puede ser posterior a publishedBefore");
        }
        
        // Validación adicional de rango de fechas razonable
        LocalDate minValidDate = LocalDate.of(1000, 1, 1);
        LocalDate maxValidDate = LocalDate.now().plusYears(5);
        
        if (publishedAfter != null && publishedAfter.isBefore(minValidDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "publishedAfter debe ser una fecha válida (después del año 1000)");
        }
        
        if (publishedBefore != null && publishedBefore.isAfter(maxValidDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "publishedBefore no puede ser más de 5 años en el futuro");
        }
        
        BookFilterDTO filter = BookFilterDTO.builder()
                .search(search)
                .title(title)
                .genreIds(genreIds)
                .authorName(authorName)
                .editorialIds(editorialIds)
                .typeId(typeId)
                .publishedAfter(publishedAfter)
                .publishedBefore(publishedBefore)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        return ResponseEntity.ok(bookService.getBooksWithFilters(filter));
    }

    @Operation(
            summary = "Obtener todos los libros V2 (con paginación)",
            description = "Lista paginada de todos los libros con metadata completa de paginación",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada obtenida exitosamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PagedResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content)
    })
    @GetMapping("/all")
    public ResponseEntity<PagedResponseDTO<BookResponseDTO>> getAllBooksPaged(
            @Parameter(description = "Número de página (empezando en 0)")
            @RequestParam(defaultValue = "0") @Min(0) int page,
            
            @Parameter(description = "Tamaño de página (máximo 100)")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            
            @Parameter(description = "Campo para ordenar (title, publishedDate, id)")
            @RequestParam(defaultValue = "id") String sortBy,
            
            @Parameter(description = "Dirección del ordenamiento (ASC, DESC)")
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        BookFilterDTO filter = BookFilterDTO.builder()
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        return ResponseEntity.ok(bookService.getBooksWithFilters(filter));
    }

    @Operation(
            summary = "Obtener libro por ID V2",
            description = "Obtiene los detalles completos de un libro específico",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Libro encontrado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Libro no encontrado", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Long id) {
        Optional<BookResponseDTO> book = bookService.getBookById(id);
        return book.map(ResponseEntity::ok)
                  .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Búsqueda rápida por título V2",
            description = "Búsqueda optimizada para autocompletado de títulos con límite de resultados",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Búsqueda exitosa",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content)
    })
    @GetMapping("/search/title")
    public ResponseEntity<List<BookResponseDTO>> searchByTitle(
            @Parameter(description = "Texto a buscar en el título")
            @RequestParam String title,
            
            @Parameter(description = "Límite de resultados (máximo 50)")
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit
    ) {
        BookFilterDTO filter = BookFilterDTO.builder()
                .title(title)
                .page(0)
                .size(limit)
                .sortBy("title")
                .sortDirection("ASC")
                .build();

        PagedResponseDTO<BookResponseDTO> result = bookService.getBooksWithFilters(filter);
        return ResponseEntity.ok(result.getContent());
    }

    @Operation(
            summary = "Estadísticas de libros V2",
            description = "Obtiene estadísticas básicas de los libros (total, por género, etc.)",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getBookStats() {
        // Obtener estadísticas básicas
        List<BookResponseDTO> allBooks = bookService.getAllBooks();
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalBooks", allBooks.size());
        stats.put("message", "Estadísticas básicas de libros V2");
        
        return ResponseEntity.ok(stats);
    }
}