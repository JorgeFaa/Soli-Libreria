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

        // Convertir a DTO de respuesta
        return new BookResponseDTO(
                savedBook.getId(),
                savedBook.getTitle(),
                savedBook.getDescription(),
                savedBook.getPublishedDate(),
                savedBook.getTextUrl(),
                savedBook.getCoverUrl(),
                savedBook.getAuthors().stream().map(Author::getId).collect(Collectors.toSet()), // Set<Long>
                savedBook.getEditorials().stream().map(Editorial::getId).collect(Collectors.toSet()), // Set<Long>
                savedBook.getGenres().stream().map(Genre::getId).collect(Collectors.toSet()),   // Set<Long>
                savedBook.getType() != null ? savedBook.getType().getId() : null
        );
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

    // Actualizar libro por ID
    @Operation(
            summary = "Actualizar un libro por ID",
            description = "Actualiza un libro específico según el ID proporcionado. Permite actualización parcial de campos."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Libro actualizado correctamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Libro no encontrado", content = @Content),
            @ApiResponse(responseCode = "400", description = "Datos de actualización inválidos", content = @Content)
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable Long id, @RequestBody BookUpdateDTO updateDTO) {
        // Verificar que el libro existe antes de la actualización
        if (!bookService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Si se proporciona un nuevo título, verificar que no exista otro libro con ese título
        if (updateDTO.getTitle() != null) {
            // Obtener el libro actual para comparar títulos
            BookResponseDTO currentBook = bookService.getBookById(id).orElse(null);
            if (currentBook != null && !currentBook.getTitle().equals(updateDTO.getTitle())) {
                // Solo verificar duplicados si el título es diferente al actual
                if (bookService.existsBookByTitle(updateDTO.getTitle())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un libro con este título");
                }
            }
        }

        // Validar que los IDs de relaciones existen (si se proporcionan)
        if (updateDTO.getAuthorIds() != null) {
            for (Long authorId : updateDTO.getAuthorIds()) {
                if (!authorService.findById(authorId).isPresent()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Autor no encontrado con ID " + authorId);
                }
            }
        }

        if (updateDTO.getEditorialIds() != null) {
            for (Long editorialId : updateDTO.getEditorialIds()) {
                if (!editorialService.findById(editorialId).isPresent()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Editorial no encontrada con ID " + editorialId);
                }
            }
        }

        if (updateDTO.getGenreIds() != null) {
            for (Long genreId : updateDTO.getGenreIds()) {
                if (!genreRepository.findById(genreId).isPresent()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Género no encontrado con ID " + genreId);
                }
            }
        }

        if (updateDTO.getTypeId() != null) {
            if (!textTypeRepository.findById(updateDTO.getTypeId()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de texto no encontrado con ID " + updateDTO.getTypeId());
            }
        }

        // Realizar la actualización
        return bookService.updateBook(id, updateDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
