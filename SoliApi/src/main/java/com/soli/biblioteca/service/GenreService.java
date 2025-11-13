package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.GenreCreateDTO;
import com.soli.biblioteca.Dto.GenreResponseDTO;
import com.soli.biblioteca.Dto.GenreUpdateDTO;
import com.soli.biblioteca.exception.ResourceNotFoundException;
import com.soli.biblioteca.mapper.GenreMapper;
import com.soli.biblioteca.model.Genre;
import com.soli.biblioteca.repository.GenreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GenreService {

    private final GenreRepository genreRepository;

    public GenreService(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    public List<GenreResponseDTO> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(GenreMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<GenreResponseDTO> getGenreById(Long id) {
        return genreRepository.findById(id).map(GenreMapper::toResponseDTO);
    }

    public GenreResponseDTO createGenre(GenreCreateDTO dto) {
        Genre genre = new Genre();
        genre.setName(dto.getGenrename());
        Genre savedGenre = genreRepository.save(genre);
        return GenreMapper.toResponseDTO(savedGenre);
    }

    public GenreResponseDTO updateGenre(Long id, GenreUpdateDTO genreDetails) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Género", id));
        genreDetails.getGenrename().ifPresent(genre::setName);
        Genre updatedGenre = genreRepository.save(genre);
        return GenreMapper.toResponseDTO(updatedGenre);
    }

    public void deleteGenre(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Género", id);
        }
        genreRepository.deleteById(id);
    }
}
