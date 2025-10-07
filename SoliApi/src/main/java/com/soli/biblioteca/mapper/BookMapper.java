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
            dto.setAuthorIds(
                    book.getAuthors().stream()
                            .map(Author::getId)
                            .collect(Collectors.toSet())
            );
        }

        if (book.getEditorials() != null) {
            dto.setEditorialIds(
                    book.getEditorials().stream()
                            .map(Editorial::getId)
                            .collect(Collectors.toSet())
            );
        }

        if (book.getGenres() != null) {
            dto.setGenreIds(
                    book.getGenres().stream()
                            .map(Genre::getId)
                            .collect(Collectors.toSet())
            );
        }

        if (book.getType() != null) {
            dto.setTypeId(book.getType().getId());
        }

        return dto;
    }
}
