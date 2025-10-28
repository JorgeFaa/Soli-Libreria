package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.AuthorCreateDTO;
import com.soli.biblioteca.Dto.AuthorUpdateDTO;
import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.repository.AuthorRepository;
import com.soli.biblioteca.repository.CountryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final CountryRepository countryRepository;

    public AuthorService(AuthorRepository authorRepository, CountryRepository countryRepository) {
        this.authorRepository = authorRepository;
        this.countryRepository = countryRepository;
    }

    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    public Optional<Author> getAuthorById(Long id) {
        return authorRepository.findById(id);
    }

    @Transactional
    public Author createAuthor(AuthorCreateDTO authorDTO) {
        Country country = countryRepository.findById(authorDTO.getCountryId())
                .orElseThrow(() -> new RuntimeException("País no encontrado con id: " + authorDTO.getCountryId()));

        Author author = new Author();
        author.setName(authorDTO.getName());
        author.setMiddleName(authorDTO.getMiddleName());
        author.setLastName(authorDTO.getLastName());
        author.setCountry(country);

        return authorRepository.save(author);
    }

    @Transactional
    public Author updateAuthor(Long id, AuthorUpdateDTO authorDTO) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Autor no encontrado con id: " + id));

        authorDTO.getName().ifPresent(author::setName);
        authorDTO.getMiddleName().ifPresent(author::setMiddleName);
        authorDTO.getLastName().ifPresent(author::setLastName);
        authorDTO.getCountryId().ifPresent(countryId -> {
            Country country = countryRepository.findById(countryId)
                    .orElseThrow(() -> new RuntimeException("País no encontrado con id: " + countryId));
            author.setCountry(country);
        });

        return authorRepository.save(author);
    }

    public void deleteAuthor(Long id) {
        authorRepository.deleteById(id);
    }
}
