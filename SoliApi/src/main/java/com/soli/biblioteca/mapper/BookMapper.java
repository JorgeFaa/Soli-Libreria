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

    // Método para actualización parcial
    public static void updateBookFromDTO(Book existingBook, BookUpdateDTO updateDTO) {
        if (updateDTO == null) return;

        // Actualizar solo los campos que no son null
        if (updateDTO.getTitle() != null) {
            existingBook.setTitle(updateDTO.getTitle());
        }
        if (updateDTO.getDescription() != null) {
            existingBook.setDescription(updateDTO.getDescription());
        }
        if (updateDTO.getPublishedDate() != null) {
            existingBook.setPublishedDate(updateDTO.getPublishedDate());
        }
        if (updateDTO.getTextUrl() != null) {
            existingBook.setTextUrl(updateDTO.getTextUrl());
        }
        if (updateDTO.getCoverUrl() != null) {
            existingBook.setCoverUrl(updateDTO.getCoverUrl());
        }

        // Para las relaciones, si se proporciona una lista (incluso vacía), reemplazar completamente
        if (updateDTO.getAuthorIds() != null) {
            existingBook.getAuthors().clear();
            updateDTO.getAuthorIds().forEach(id -> {
                Author author = new Author();
                author.setId(id);
                existingBook.getAuthors().add(author);
            });
        }

        if (updateDTO.getEditorialIds() != null) {
            existingBook.getEditorials().clear();
            updateDTO.getEditorialIds().forEach(id -> {
                Editorial editorial = new Editorial();
                editorial.setId(id);
                existingBook.getEditorials().add(editorial);
            });
        }

        if (updateDTO.getGenreIds() != null) {
            existingBook.getGenres().clear();
            updateDTO.getGenreIds().forEach(id -> {
                Genre genre = new Genre();
                genre.setId(id);
                existingBook.getGenres().add(genre);
            });
        }

        if (updateDTO.getTypeId() != null) {
            TextType type = new TextType();
            type.setId(updateDTO.getTypeId());
            existingBook.setType(type);
        }
    }
}
