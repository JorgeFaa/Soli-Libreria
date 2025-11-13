package com.soli.biblioteca.controller.v3;

import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.Dto.BookFilterDTO;
import com.soli.biblioteca.Dto.PagedResponseDTO;
import com.soli.biblioteca.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V3_PREFIX;

@RestController
@RequestMapping(API_V3_PREFIX + "/books")
@Tag(name = "Book Management V3", description = "API v3 para gestión de libros")
@Validated
public class BookControllerV3 {

    private final BookService bookService;

    public BookControllerV3(BookService bookService) {
        this.bookService = bookService;
    }

    @Operation(summary = "Obtener múltiples libros por sus IDs")
    @GetMapping("/by-ids")
    public ResponseEntity<List<BookResponseDTO>> getBooksByIds(
            @Parameter(description = "Lista de IDs de libros, separados por coma")
            @RequestParam List<Long> ids
    ) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bookService.getBooksByIds(ids));
    }

    @Operation(summary = "Obtener un libro por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Búsqueda avanzada de libros")
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
        if (publishedAfter != null && publishedBefore != null && publishedAfter.isAfter(publishedBefore)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "publishedAfter no puede ser posterior a publishedBefore");
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
}
