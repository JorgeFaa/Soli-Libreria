package com.soli.biblioteca.controller.v3;

import com.soli.biblioteca.Dto.AuthorCreateDTO;
import com.soli.biblioteca.Dto.AuthorUpdateDTO;
import com.soli.biblioteca.Dto.BookCreateDTO;
import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.Dto.BookUpdateDTO;
import com.soli.biblioteca.Dto.CountryUpdateDTO;
import com.soli.biblioteca.Dto.EditorialCreateDTO;
import com.soli.biblioteca.Dto.EditorialUpdateDTO;
import com.soli.biblioteca.Dto.GenreUpdateDTO;
import com.soli.biblioteca.Dto.TextTypeUpdateDTO;
import com.soli.biblioteca.Dto.UserDTO;
import com.soli.biblioteca.model.*;
import com.soli.biblioteca.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V3_PREFIX;

@RestController
@RequestMapping(API_V3_PREFIX + "/admin")
@Tag(name = "Admin V3", description = "API v3 para la administración de entidades de la biblioteca")
@SecurityRequirement(name = "bearerAuth") // Requerir JWT para todo el controlador
@PreAuthorize("hasRole('ADMIN')") // Por defecto, solo ADMINS
public class AdminController {

    private final CountryService countryService;
    private final AuthorService authorService;
    private final GenreService genreService;
    private final TextTypeService textTypeService;
    private final EditorialService editorialService;
    private final UserService userService;
    private final BookService bookService;

    public AdminController(CountryService countryService, AuthorService authorService, GenreService genreService, TextTypeService textTypeService, EditorialService editorialService, UserService userService, BookService bookService) {
        this.countryService = countryService;
        this.authorService = authorService;
        this.genreService = genreService;
        this.textTypeService = textTypeService;
        this.editorialService = editorialService;
        this.userService = userService;
        this.bookService = bookService;
    }

    // ========== CRUD de Países (Country) ==========

    @Operation(summary = "Obtener todos los países")
    @GetMapping("/countries")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<Country>> getAllCountries() {
        return ResponseEntity.ok(countryService.getAllCountries());
    }

    @Operation(summary = "Obtener un país por ID")
    @GetMapping("/countries/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<Country> getCountryById(@PathVariable Long id) {
        return countryService.getCountryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear un nuevo país")
    @PostMapping("/countries")
    public ResponseEntity<Country> createCountry(@RequestBody Country country) {
        return ResponseEntity.status(HttpStatus.CREATED).body(countryService.createCountry(country));
    }

    @Operation(summary = "Actualizar un país")
    @PutMapping("/countries/{id}")
    public ResponseEntity<Country> updateCountry(@PathVariable Long id, @RequestBody CountryUpdateDTO countryDetails) {
        return ResponseEntity.ok(countryService.updateCountry(id, countryDetails));
    }

    @Operation(summary = "Eliminar un país")
    @DeleteMapping("/countries/{id}")
    public ResponseEntity<Void> deleteCountry(@PathVariable Long id) {
        countryService.deleteCountry(id);
        return ResponseEntity.noContent().build();
    }

    // ========== CRUD de Autores (Author) ==========

    @Operation(summary = "Obtener todos los autores")
    @GetMapping("/authors")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<Author>> getAllAuthors() {
        return ResponseEntity.ok(authorService.getAllAuthors());
    }

    @Operation(summary = "Obtener un autor por ID")
    @GetMapping("/authors/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<Author> getAuthorById(@PathVariable Long id) {
        return authorService.getAuthorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear un nuevo autor")
    @PostMapping("/authors")
    public ResponseEntity<Author> createAuthor(@RequestBody AuthorCreateDTO authorDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authorService.createAuthor(authorDTO));
    }

    @Operation(summary = "Actualizar un autor")
    @PutMapping("/authors/{id}")
    public ResponseEntity<Author> updateAuthor(@PathVariable Long id, @RequestBody AuthorUpdateDTO authorDTO) {
        return ResponseEntity.ok(authorService.updateAuthor(id, authorDTO));
    }

    @Operation(summary = "Eliminar un autor")
    @DeleteMapping("/authors/{id}")
    public ResponseEntity<Void> deleteAuthor(@PathVariable Long id) {
        authorService.deleteAuthor(id);
        return ResponseEntity.noContent().build();
    }

    // ========== CRUD de Géneros (Genre) ==========

    @Operation(summary = "Obtener todos los géneros")
    @GetMapping("/genres")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<Genre>> getAllGenres() {
        return ResponseEntity.ok(genreService.getAllGenres());
    }

    @Operation(summary = "Obtener un género por ID")
    @GetMapping("/genres/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<Genre> getGenreById(@PathVariable Long id) {
        return genreService.getGenreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear un nuevo género")
    @PostMapping("/genres")
    public ResponseEntity<Genre> createGenre(@RequestBody Genre genre) {
        return ResponseEntity.status(HttpStatus.CREATED).body(genreService.createGenre(genre));
    }

    @Operation(summary = "Actualizar un género")
    @PutMapping("/genres/{id}")
    public ResponseEntity<Genre> updateGenre(@PathVariable Long id, @RequestBody GenreUpdateDTO genreDetails) {
        return ResponseEntity.ok(genreService.updateGenre(id, genreDetails));
    }

    @Operation(summary = "Eliminar un género")
    @DeleteMapping("/genres/{id}")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }

    // ========== CRUD de Tipos de Texto (TextType) ==========

    @Operation(summary = "Obtener todos los tipos de texto")
    @GetMapping("/text-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<TextType>> getAllTextTypes() {
        return ResponseEntity.ok(textTypeService.getAllTextTypes());
    }

    @Operation(summary = "Obtener un tipo de texto por ID")
    @GetMapping("/text-types/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<TextType> getTextTypeById(@PathVariable Long id) {
        return textTypeService.getTextTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear un nuevo tipo de texto")
    @PostMapping("/text-types")
    public ResponseEntity<TextType> createTextType(@RequestBody TextType textType) {
        return ResponseEntity.status(HttpStatus.CREATED).body(textTypeService.createTextType(textType));
    }

    @Operation(summary = "Actualizar un tipo de texto")
    @PutMapping("/text-types/{id}")
    public ResponseEntity<TextType> updateTextType(@PathVariable Long id, @RequestBody TextTypeUpdateDTO textTypeDetails) {
        return ResponseEntity.ok(textTypeService.updateTextType(id, textTypeDetails));
    }

    @Operation(summary = "Eliminar un tipo de texto")
    @DeleteMapping("/text-types/{id}")
    public ResponseEntity<Void> deleteTextType(@PathVariable Long id) {
        textTypeService.deleteTextType(id);
        return ResponseEntity.noContent().build();
    }

    // ========== CRUD de Editoriales (Editorial) ==========

    @Operation(summary = "Obtener todas las editoriales")
    @GetMapping("/editorials")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<Editorial>> getAllEditorials() {
        return ResponseEntity.ok(editorialService.getAllEditorials());
    }

    @Operation(summary = "Obtener una editorial por ID")
    @GetMapping("/editorials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<Editorial> getEditorialById(@PathVariable Long id) {
        return editorialService.getEditorialById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear una nueva editorial")
    @PostMapping("/editorials")
    public ResponseEntity<Editorial> createEditorial(@RequestBody EditorialCreateDTO editorialDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(editorialService.createEditorial(editorialDTO));
    }

    @Operation(summary = "Actualizar una editorial")
    @PutMapping("/editorials/{id}")
    public ResponseEntity<Editorial> updateEditorial(@PathVariable Long id, @RequestBody EditorialUpdateDTO editorialDTO) {
        return ResponseEntity.ok(editorialService.updateEditorial(id, editorialDTO));
    }

    @Operation(summary = "Eliminar una editorial")
    @DeleteMapping("/editorials/{id}")
    public ResponseEntity<Void> deleteEditorial(@PathVariable Long id) {
        editorialService.deleteEditorial(id);
        return ResponseEntity.noContent().build();
    }

    // ========== CRUD de Libros (Book) ==========

    @Operation(summary = "Crear un nuevo libro")
    @PostMapping("/books")
    public ResponseEntity<BookResponseDTO> createBook(@Valid @RequestBody BookCreateDTO bookCreateDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.createBook(bookCreateDTO));
    }

    @Operation(summary = "Actualizar un libro (parcial)")
    @PutMapping("/books/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable Long id, @Valid @RequestBody BookUpdateDTO bookUpdateDTO) {
        return ResponseEntity.ok(bookService.updateBook(id, bookUpdateDTO));
    }

    @Operation(summary = "Eliminar un libro")
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Gestión de Usuarios ==========

    @Operation(summary = "Obtener todos los usuarios")
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Obtener un usuario por ID")
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Eliminar un usuario")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
