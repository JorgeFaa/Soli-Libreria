package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.AuthorCreateDTO;
import com.soli.biblioteca.Dto.AuthorResponseDTO;
import com.soli.biblioteca.Dto.AuthorUpdateDTO;
import com.soli.biblioteca.exception.ResourceNotFoundException;
import com.soli.biblioteca.mapper.AuthorMapper;
import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.repository.AuthorRepository;
import com.soli.biblioteca.repository.CountryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final CountryRepository countryRepository;

    public AuthorService(AuthorRepository authorRepository, CountryRepository countryRepository) {
        this.authorRepository = authorRepository;
        this.countryRepository = countryRepository;
    }

    public List<AuthorResponseDTO> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(AuthorMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<AuthorResponseDTO> getAuthorById(Long id) {
        return authorRepository.findById(id).map(AuthorMapper::toResponseDTO);
    }

    @Transactional
    public AuthorResponseDTO createAuthor(AuthorCreateDTO authorDTO) {
        Country country = countryRepository.findById(authorDTO.getCountryId())
                .orElseThrow(() -> new ResourceNotFoundException("País", authorDTO.getCountryId()));

        Author author = new Author();
        author.setName(authorDTO.getName());
        author.setMiddleName(authorDTO.getMiddleName());
        author.setLastName(authorDTO.getLastName());
        author.setCountry(country);

        Author savedAuthor = authorRepository.save(author);
        return AuthorMapper.toResponseDTO(savedAuthor);
    }

    @Transactional
    public AuthorResponseDTO updateAuthor(Long id, AuthorUpdateDTO authorDTO) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Autor", id));

        authorDTO.getName().ifPresent(author::setName);
        authorDTO.getMiddleName().ifPresent(author::setMiddleName);
        authorDTO.getLastName().ifPresent(author::setLastName);
        authorDTO.getCountryId().ifPresent(countryId -> {
            Country country = countryRepository.findById(countryId)
                    .orElseThrow(() -> new ResourceNotFoundException("País", countryId));
            author.setCountry(country);
        });

        Author updatedAuthor = authorRepository.save(author);
        return AuthorMapper.toResponseDTO(updatedAuthor);
    }

    public void deleteAuthor(Long id) {
        if (!authorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Autor", id);
        }
        authorRepository.deleteById(id);
    }
}
