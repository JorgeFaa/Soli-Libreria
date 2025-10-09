package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.BookCreateDTO;
import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.Dto.BookUpdateDTO;
import com.soli.biblioteca.model.*;
import com.soli.biblioteca.repository.GenreRepository;
import com.soli.biblioteca.repository.TextTypeRepository;
import com.soli.biblioteca.service.AuthorService;
import com.soli.biblioteca.service.BookService;
import com.soli.biblioteca.service.EditorialService;
import com.soli.biblioteca.mapper.BookMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/books")
@Tag(name = "Libros", description = "Operaciones CRUD para la gestión de libros")
public class BookController {

    private final BookService bookService;
    private final AuthorService authorService;
    private final EditorialService editorialService;
    private final GenreRepository genreRepository;
    private final TextTypeRepository textTypeRepository;

    public BookController(BookService bookService, AuthorService authorService,
                          EditorialService editorialService,
                          GenreRepository genreRepository,
                          TextTypeRepository textTypeRepository) {
        this.bookService = bookService;
        this.authorService = authorService;
        this.editorialService = editorialService;
        this.genreRepository = genreRepository;
        this.textTypeRepository = textTypeRepository;
    }

    // Crear libro
    @Operation(
            summary = "Crear un libro",
            description = "Crea un nuevo libro en la base de datos"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Libro creado correctamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content)
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public BookResponseDTO createBook(@RequestBody BookCreateDTO dto) {

        // Verificar título duplicado
        if (bookService.existsBookByTitle(dto.getTitle())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Book already exists");
        }

        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublishedDate(dto.getPublishedDate());
        book.setTextUrl(dto.getTextUrl());
        book.setCoverUrl(dto.getCoverUrl());

        // Asignar autores
        for (Long authorId : dto.getAuthorIds()) {
            Author author = authorService.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Autor no encontrado con ID " + authorId));
            book.getAuthors().add(author);
        }

        // Asignar editorial
        for (Long editorialId : dto.getEditorialIds()) {
            Editorial editorial = editorialService.findById(editorialId)
                    .orElseThrow(() -> new RuntimeException("Editorial no encontrada con ID " + editorialId));
            book.getEditorials().add(editorial);
        }

        // Asignar géneros
        for (Long genreId : dto.getGenreIds()) {
            Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new RuntimeException("Género no encontrado con ID " + genreId));
            book.getGenres().add(genre);
        }

        // Asignar tipo de texto
        TextType type = textTypeRepository.findById(dto.getTypeId())
                .orElseThrow(() -> new RuntimeException("Tipo de texto no encontrado con ID " + dto.getTypeId()));
        book.setType(type);

        // Guardar libro
        Book savedBook = bookService.createBook(book);

        // Convertir a DTO de respuesta con entidades embebidas
        return BookMapper.toResponseDTO(savedBook);
    }

    // Obtener todos los libros
    @Operation(
            summary = "Obtener todos los libros",
            description = "Devuelve una lista con todos los libros disponibles"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de libros obtenida correctamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookResponseDTO.class)))
    })
    @GetMapping
    public ResponseEntity<List<BookResponseDTO>> getAllBooks() {
        List<BookResponseDTO> books = bookService.getAllBooks();
        return ResponseEntity.ok(books);
    }

    // Obtener libro por ID
    @Operation(
            summary = "Obtener un libro por ID",
            description = "Devuelve un libro específico según el ID proporcionado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Libro encontrado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Libro no encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Actualizar parcialmente un libro por ID (PUT parcial)
    @Operation(
            summary = "Actualizar parcialmente un libro",
            description = "Actualiza solo los campos enviados en el payload"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Libro actualizado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Libro no encontrado", content = @Content)
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable Long id, @RequestBody BookUpdateDTO dto) {
        Book book = bookService.findEntityById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        // Campos simples
        if (dto.getTitle() != null) book.setTitle(dto.getTitle());
        if (dto.getDescription() != null) book.setDescription(dto.getDescription());
        if (dto.getPublishedDate() != null) book.setPublishedDate(dto.getPublishedDate());
        if (dto.getTextUrl() != null) book.setTextUrl(dto.getTextUrl());
        if (dto.getCoverUrl() != null) book.setCoverUrl(dto.getCoverUrl());

        // Relaciones: si vienen presentes (incluso vacías) reemplazamos
        if (dto.getAuthorIds() != null) {
            book.getAuthors().clear();
            for (Long authorId : dto.getAuthorIds()) {
                Author author = authorService.findById(authorId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Autor no encontrado con ID " + authorId));
                book.getAuthors().add(author);
            }
        }
        if (dto.getEditorialIds() != null) {
            book.getEditorials().clear();
            for (Long editorialId : dto.getEditorialIds()) {
                Editorial editorial = editorialService.findById(editorialId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Editorial no encontrada con ID " + editorialId));
                book.getEditorials().add(editorial);
            }
        }
        if (dto.getGenreIds() != null) {
            book.getGenres().clear();
            for (Long genreId : dto.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Género no encontrado con ID " + genreId));
                book.getGenres().add(genre);
            }
        }
        if (dto.getTypeId() != null) {
            TextType type = textTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de texto no encontrado con ID " + dto.getTypeId()));
            book.setType(type);
        }

        Book saved = bookService.save(book);
        return ResponseEntity.ok(BookMapper.toResponseDTO(saved));
    }

    // Eliminar libro por ID
    @Operation(
            summary = "Eliminar un libro por ID",
            description = "Elimina un libro específico según el ID proporcionado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Libro eliminado correctamente", content = @Content),
            @ApiResponse(responseCode = "404", description = "Libro no encontrado", content = @Content)
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        boolean deleted = bookService.deleteBook(id);
        if (deleted) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}
