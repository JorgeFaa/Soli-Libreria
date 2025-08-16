package com.soli.biblioteca.controller;

import com.soli.biblioteca.model.Book;
import com.soli.biblioteca.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@Tag(name = "Libros", description = "Operaciones CRUD para la gestión de libros")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // Crear libro
    @Operation(
            summary = "Crear un libro",
            description = "Crea un nuevo libro en la base de datos"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Libro creado correctamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Book.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content)
    })
    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        Book newBook = bookService.createBook(book);
        return ResponseEntity.ok(newBook);
    }

    // Obtener todos los libros
    @Operation(
            summary = "Obtener todos los libros",
            description = "Devuelve una lista con todos los libros disponibles"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de libros obtenida correctamente",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Book.class)))
    })
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
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
                            schema = @Schema(implementation = Book.class))),
            @ApiResponse(responseCode = "404", description = "Libro no encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}