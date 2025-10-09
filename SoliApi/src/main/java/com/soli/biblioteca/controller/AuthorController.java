package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.AuthorCreateDTO;
import com.soli.biblioteca.Dto.AuthorResponseDTO;
import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.service.AuthorService;
import com.soli.biblioteca.service.CountryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/authors")
public class AuthorController {

    private final AuthorService authorService;
    private final CountryService countryService;

    public AuthorController(AuthorService authorService, CountryService countryService) {
        this.authorService = authorService;
        this.countryService = countryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthorResponseDTO> createAuthor(@Valid @RequestBody AuthorCreateDTO dto) {
        if (authorService.existsByAuthorName(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Author already exists");
        }
        Country country = countryService.findById(dto.getCountryID())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Country not found"));

        Author author = new Author();
        author.setName(dto.getName());
        author.setMiddleName(dto.getMiddleName());
        author.setLastName(dto.getLastName());
        author.setCountry(country);

        Author saved = authorService.save(author);

        AuthorResponseDTO response = new AuthorResponseDTO(
                saved.getId(),
                saved.getName(),
                saved.getMiddleName(),
                saved.getLastName(),
                saved.getCountry().getName()
        );

URI location = URI.create("/authors/" + saved.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<AuthorResponseDTO> getAll() {
        return authorService.findAll().stream()
                .map(author -> new AuthorResponseDTO(
                        author.getId(),
                        author.getName(),
                        author.getMiddleName(),
                        author.getLastName(),
                        author.getCountry().getName()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorResponseDTO> getById(@PathVariable Long id) {
        Author author = authorService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Author not found"));

        AuthorResponseDTO dto = new AuthorResponseDTO(
                author.getId(),
                author.getName(),
                author.getMiddleName(),
                author.getLastName(),
                author.getCountry().getName()
        );

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (authorService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        authorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
