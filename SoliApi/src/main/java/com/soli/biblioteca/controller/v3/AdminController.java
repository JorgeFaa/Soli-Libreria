package com.soli.biblioteca.controller.v3;

import com.soli.biblioteca.Dto.*;
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
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
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

    // ========== Books (Batch) ==========

    @Operation(summary = "Crear múltiples libros en una sola petición")
    @PostMapping("/books/batch")
    public ResponseEntity<List<BookResponseDTO>> createBooks(@Valid @RequestBody List<BookCreateDTO> bookCreateDTOs) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.createBooks(bookCreateDTOs));
    }

    // ========== Countries ==========

    @GetMapping("/countries")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<CountryResponseDTO>> getAllCountries() {
        return ResponseEntity.ok(countryService.getAllCountries());
    }

    @GetMapping("/countries/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<CountryResponseDTO> getCountryById(@PathVariable Long id) {
        return countryService.getCountryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/countries")
    public ResponseEntity<CountryResponseDTO> createCountry(@Valid @RequestBody CountryCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(countryService.createCountry(dto));
    }

    @PutMapping("/countries/{id}")
    public ResponseEntity<CountryResponseDTO> updateCountry(@PathVariable Long id, @Valid @RequestBody CountryUpdateDTO countryDetails) {
        return ResponseEntity.ok(countryService.updateCountry(id, countryDetails));
    }

    @DeleteMapping("/countries/{id}")
    public ResponseEntity<Void> deleteCountry(@PathVariable Long id) {
        countryService.deleteCountry(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Authors ==========

    @GetMapping("/authors")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<AuthorResponseDTO>> getAllAuthors() {
        return ResponseEntity.ok(authorService.getAllAuthors());
    }

    @GetMapping("/authors/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<AuthorResponseDTO> getAuthorById(@PathVariable Long id) {
        return authorService.getAuthorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/authors")
    public ResponseEntity<AuthorResponseDTO> createAuthor(@Valid @RequestBody AuthorCreateDTO authorDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authorService.createAuthor(authorDTO));
    }

    @PutMapping("/authors/{id}")
    public ResponseEntity<AuthorResponseDTO> updateAuthor(@PathVariable Long id, @Valid @RequestBody AuthorUpdateDTO authorDTO) {
        return ResponseEntity.ok(authorService.updateAuthor(id, authorDTO));
    }

    @DeleteMapping("/authors/{id}")
    public ResponseEntity<Void> deleteAuthor(@PathVariable Long id) {
        authorService.deleteAuthor(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Genres ==========

    @GetMapping("/genres")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<GenreResponseDTO>> getAllGenres() {
        return ResponseEntity.ok(genreService.getAllGenres());
    }

    @GetMapping("/genres/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<GenreResponseDTO> getGenreById(@PathVariable Long id) {
        return genreService.getGenreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/genres")
    public ResponseEntity<GenreResponseDTO> createGenre(@Valid @RequestBody GenreCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(genreService.createGenre(dto));
    }

    @PutMapping("/genres/{id}")
    public ResponseEntity<GenreResponseDTO> updateGenre(@PathVariable Long id, @Valid @RequestBody GenreUpdateDTO genreDetails) {
        return ResponseEntity.ok(genreService.updateGenre(id, genreDetails));
    }

    @DeleteMapping("/genres/{id}")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }

    // ========== TextTypes ==========

    @GetMapping("/text-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<TextTypeResponseDTO>> getAllTextTypes() {
        return ResponseEntity.ok(textTypeService.getAllTextTypes());
    }

    @GetMapping("/text-types/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<TextTypeResponseDTO> getTextTypeById(@PathVariable Long id) {
        return textTypeService.getTextTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/text-types")
    public ResponseEntity<TextTypeResponseDTO> createTextType(@Valid @RequestBody TextTypeCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(textTypeService.createTextType(dto));
    }

    @PutMapping("/text-types/{id}")
    public ResponseEntity<TextTypeResponseDTO> updateTextType(@PathVariable Long id, @Valid @RequestBody TextTypeUpdateDTO textTypeDetails) {
        return ResponseEntity.ok(textTypeService.updateTextType(id, textTypeDetails));
    }

    @DeleteMapping("/text-types/{id}")
    public ResponseEntity<Void> deleteTextType(@PathVariable Long id) {
        textTypeService.deleteTextType(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Editorials ==========

    @GetMapping("/editorials")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<List<EditorialResponseDTO>> getAllEditorials() {
        return ResponseEntity.ok(editorialService.getAllEditorials());
    }

    @GetMapping("/editorials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'READER')")
    public ResponseEntity<EditorialResponseDTO> getEditorialById(@PathVariable Long id) {
        return editorialService.getEditorialById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/editorials")
    public ResponseEntity<EditorialResponseDTO> createEditorial(@Valid @RequestBody EditorialCreateDTO editorialDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(editorialService.createEditorial(editorialDTO));
    }

    @PutMapping("/editorials/{id}")
    public ResponseEntity<EditorialResponseDTO> updateEditorial(@PathVariable Long id, @Valid @RequestBody EditorialUpdateDTO editorialDTO) {
        return ResponseEntity.ok(editorialService.updateEditorial(id, editorialDTO));
    }

    @DeleteMapping("/editorials/{id}")
    public ResponseEntity<Void> deleteEditorial(@PathVariable Long id) {
        editorialService.deleteEditorial(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Books ==========

    @PostMapping("/books")
    public ResponseEntity<BookResponseDTO> createBook(@Valid @RequestBody BookCreateDTO bookCreateDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.createBook(bookCreateDTO));
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<BookResponseDTO> updateBook(@PathVariable Long id, @Valid @RequestBody BookUpdateDTO bookUpdateDTO) {
        return ResponseEntity.ok(bookService.updateBook(id, bookUpdateDTO));
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Users ==========

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
