package com.soli.biblioteca.service;

import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public Author save(Author author) { return authorRepository.save(author); }

    public List<Author> findAll() { return authorRepository.findAll(); }

    public boolean existsByAuthorName(String name){ return authorRepository.existsByName(name); }

    public Optional<Author> findById(Long id) { return authorRepository.findById(id); }

    public void delete(Long id) { authorRepository.deleteById(id); }
    
    public List<Author> findByNameContaining(String name) {
        return authorRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Author> findByCountryName(String countryName) {
        return authorRepository.findByCountryNameContainingIgnoreCase(countryName);
    }
}