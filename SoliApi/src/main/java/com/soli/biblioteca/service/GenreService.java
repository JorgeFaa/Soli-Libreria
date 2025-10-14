package com.soli.biblioteca.service;

import com.soli.biblioteca.model.Genre;
import com.soli.biblioteca.repository.GenreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GenreService {
    private final GenreRepository genreRepository;

    public GenreService(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    public Genre save(Genre genre) { return genreRepository.save(genre); }

    public List<Genre> findAll() { return genreRepository.findAll(); }

    public boolean existsByName(String name){ return genreRepository.existsByName(name); }

    public Optional<Genre> findById(Long id) { return genreRepository.findById(id); }

    public void delete(Long id) { genreRepository.deleteById(id); }
    
    public List<Genre> findByNameContaining(String name) {
        return genreRepository.findByNameContainingIgnoreCase(name);
    }
    
    // Métodos avanzados para V2
    public List<Genre> findByNameFilter(String name) {
        if (name != null && !name.trim().isEmpty()) {
            return findByNameContaining(name);
        } else {
            return findAll();
        }
    }
}
