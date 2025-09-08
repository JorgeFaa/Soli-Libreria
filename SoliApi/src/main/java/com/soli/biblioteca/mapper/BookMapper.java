package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.*;
import com.soli.biblioteca.model.*;

public class BookMapper {

    // DTO → Entidad
    public static Book toEntity(BookCreateDTO dto) {
        if (dto == null) return null;

        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setPublishedDate(dto.getPublishedDate());

        if (dto.getAuthorId() != null) {
            Author author = new Author();
            author.setAuthorId(dto.getAuthorId()); // solo referencia
            book.setAuthor(author);
        }

        if (dto.getEditorialId() != null) {
            Editorial editorial = new Editorial();
            editorial.setEditorialId(dto.getEditorialId());
            book.setEditorial(editorial);
        }

        if (dto.getGenreId() != null) {
            Genre genre = new Genre();
            genre.setGenreId(dto.getGenreId());
            book.setGenre(genre);
        }

        if (dto.getTypeId() != null) {
            TextType type = new TextType();
            type.setTypeId(dto.getTypeId());
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
        dto.setPublishedDate(book.getPublishedDate());

        if (book.getAuthor() != null) {
            dto.setAuthorId(book.getAuthor().getAuthorId());
        }

        if (book.getEditorial() != null) {
            dto.setEditorialId(book.getEditorial().getEditorialId());
        }

        if (book.getGenre() != null) {
            dto.setGenreId(book.getGenre().getGenreId());
        }

        if (book.getType() != null) {
            dto.setTypeId(book.getType().getTypeId());
        }

        return dto;
    }
}
