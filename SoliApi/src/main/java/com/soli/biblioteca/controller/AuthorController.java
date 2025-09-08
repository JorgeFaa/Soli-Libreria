package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.AuthorCreateDTO;
import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.service.AuthorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @PostMapping
    public ResponseEntity<Author> createAuthor(@RequestBody AuthorCreateDTO dto) {
        Author author = new Author();
        author.setAuthorName(dto.getName());
        author.setAuthorMiddleName(dto.getMiddleName());
        author.setAuthorLastName(dto.getLastName());

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
