package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.AuthorResponseDTO;
import com.soli.biblioteca.model.Author;

public class AuthorMapper {

    public static AuthorResponseDTO toResponseDTO(Author author) {
        if (author == null) return null;

        return new AuthorResponseDTO(
                author.getId(),
                author.getName(),
                author.getMiddleName(),
                author.getLastName(),
                author.getCountry() != null ? author.getCountry().getName() : null
        );
    }
}
