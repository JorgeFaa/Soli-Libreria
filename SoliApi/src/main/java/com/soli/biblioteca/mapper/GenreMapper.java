package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.GenreResponseDTO;
import com.soli.biblioteca.model.Genre;

public class GenreMapper {

    public static GenreResponseDTO toResponseDTO(Genre genre) {
        if (genre == null) return null;

        return new GenreResponseDTO(
                genre.getId(),
                genre.getName()
        );
    }
}
