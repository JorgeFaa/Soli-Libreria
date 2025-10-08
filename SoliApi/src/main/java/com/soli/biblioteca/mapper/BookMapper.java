package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.model.*;

import java.util.stream.Collectors;

public class BookMapper {

    // DTO → Entidad
    public static Book toEntity(BookCreateDTO dto) {
        if (dto == null) return null;

        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setPublishedDate(dto.getPublishedDate());
        book.setTextUrl(dto.getTextUrl());
        book.setCoverUrl(dto.getCoverUrl());

        if (dto.getAuthorIds() != null) {
            book.setAuthors(
                    dto.getAuthorIds().stream()
                            .map(id -> {
                                Author author = new Author();
                                author.setId(id);
                                return author;
                            })
                            .collect(Collectors.toSet())
            );
        }

        if (dto.getEditorialIds() != null) {
            book.setEditorials(
                    dto.getEditorialIds().stream()
                            .map(id -> {
                                Editorial editorial = new Editorial();
                                editorial.setId(id);
                                return editorial;
                            })
                            .collect(Collectors.toSet())
            );
        }

        if (dto.getGenreIds() != null) {
            book.setGenres(
                    dto.getGenreIds().stream()
                            .map(id -> {
                                Genre genre = new Genre();
                                genre.setId(id);
                                return genre;
                            })
                            .collect(Collectors.toSet())
            );
        }

        if (dto.getTypeId() != null) {
            TextType type = new TextType();
            type.setId(dto.getTypeId());
            book.setType(type);
        }

        return book;
    }

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
