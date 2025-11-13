package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.BookResponseDTO;
import com.soli.biblioteca.model.Book;
import com.soli.biblioteca.model.Author;
import com.soli.biblioteca.model.Editorial;
import com.soli.biblioteca.model.Genre;

import java.util.stream.Collectors;

public class BookMapper {

    public static BookResponseDTO toResponseDTO(Book book) {
        if (book == null) return null;

        BookResponseDTO dto = new BookResponseDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setPublishedDate(book.getPublishedDate());
        dto.setPdfUrl(book.getPdfUrl());
        dto.setEpubUrl(book.getEpubUrl());
        dto.setCoverUrl(book.getCoverUrl());

        if (book.getType() != null) {
            dto.setType(TextTypeMapper.toResponseDTO(book.getType()));
        }

        if (book.getAuthors() != null) {
            dto.setAuthors(
                    book.getAuthors().stream()
                            .map(AuthorMapper::toResponseDTO)
                            .collect(Collectors.toSet())
            );
        }

        if (book.getEditorials() != null) {
            dto.setEditorials(
                    book.getEditorials().stream()
                            .map(EditorialMapper::toResponseDTO)
                            .collect(Collectors.toSet())
            );
        }

        if (book.getGenres() != null) {
            dto.setGenres(
                    book.getGenres().stream()
                            .map(GenreMapper::toResponseDTO)
                            .collect(Collectors.toSet())
            );
        }

        return dto;
    }
}
