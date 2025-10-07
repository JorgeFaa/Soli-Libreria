package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.GenreCreateDTO;
import com.soli.biblioteca.Dto.GenreResponseDTO;
import com.soli.biblioteca.model.Genre;
import com.soli.biblioteca.service.GenreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/genres")
public class GenreController {

    private final GenreService genreService;

    public GenreController(GenreService genreService) {
        this.genreService = genreService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GenreResponseDTO> create(@Valid @RequestBody GenreCreateDTO dto) {
        if (genreService.existsByName(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Genre already exists");
        }

        Genre genre = new Genre();
        genre.setName(dto.getName());
        Genre saved = genreService.save(genre);

        GenreResponseDTO response = new GenreResponseDTO(saved.getId(), saved.getName());
        URI location = URI.create("/api/genres/" + saved.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<GenreResponseDTO> getAll() {
        return genreService.findAll()
                .stream()
                .map(g -> new GenreResponseDTO(g.getId(), g.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GenreResponseDTO> getById(@PathVariable Long id) {
        return genreService.findById(id)
                .map(g -> ResponseEntity.ok(new GenreResponseDTO(g.getId(), g.getName())))
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Genre not found"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (genreService.findById(id).isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Genre not found");
        }
        genreService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
