package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.model.*;

import java.util.stream.Collectors;

public class BookMapper {

    // Entidad → ResponseDTO
    public static BookResponseDTO toResponseDTO(Book book) {
        if (book == null) return null;

        BookResponseDTO dto = new BookResponseDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setPublishedDate(book.getPublishedDate());
        dto.setTextUrl(book.getTextUrl());
        dto.setCoverUrl(book.getCoverUrl());

        if (book.getAuthors() != null) {
            dto.setAuthors(
                    book.getAuthors().stream()
                            .map(a -> new AuthorResponseDTO(
                                    a.getId(),
                                    a.getName(),
                                    a.getMiddleName(),
                                    a.getLastName(),
                                    a.getCountry() != null ? a.getCountry().getName() : null
                            ))
                            .collect(Collectors.toSet())
            );
        }

        if (book.getEditorials() != null) {
            dto.setEditorials(
                    book.getEditorials().stream()
                            .map(e -> new EditorialResponseDTO(
                                    e.getId(),
                                    e.getCompanyName(),
                                    e.getCountry() != null ? e.getCountry().getId() : null,
                                    e.getCountry() != null ? e.getCountry().getName() : null
                            ))
                            .collect(Collectors.toSet())
            );
        }

        if (book.getGenres() != null) {
            dto.setGenres(
                    book.getGenres().stream()
                            .map(g -> new GenreResponseDTO(g.getId(), g.getName()))
                            .collect(Collectors.toSet())
            );
        }

        if (book.getType() != null) {
            dto.setType(new TextTypeResponseDTO(book.getType().getId(), book.getType().getType()));
        }

        return dto;
    }
}
