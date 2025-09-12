package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.AuthorCreateDTO;
import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.service.AuthorService;
import com.soli.biblioteca.service.CountryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService authorService;
    private final CountryService countryService;

    public AuthorController(AuthorService authorService, CountryService countryService) {
        this.authorService = authorService;
        this.countryService = countryService;
    }

    @PostMapping
    public ResponseEntity<Author> createAuthor(@RequestBody AuthorCreateDTO dto) {
        Country country = countryService.findById(dto.getCountryID())
                .orElseThrow(() -> new RuntimeException("Country not found"));

        Author author = new Author();
        author.setName(dto.getName());
        author.setMiddleName(dto.getMiddleName());
        author.setLastName(dto.getLastName());
        author.setCountry(country);

        return ResponseEntity.ok(authorService.save(author));
    }

    @GetMapping
    public List<Author> getAll() {
        return authorService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> getById(@PathVariable Long id) {
        return authorService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        authorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
