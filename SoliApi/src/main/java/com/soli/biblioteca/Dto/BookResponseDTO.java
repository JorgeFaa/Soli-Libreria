package com.soli.biblioteca.Dto;

import java.time.LocalDate;

public class BookResponseDTO {

    private Long id;
    private String title;
    private LocalDate publishedDate;

    private Long authorId;
    private Long editorialId;
    private Long genreId;
    private Long typeId;

    // --------- Getters y Setters ---------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getPublishedDate() { return publishedDate; }
    public void setPublishedDate(LocalDate publishedDate) { this.publishedDate = publishedDate; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public Long getEditorialId() { return editorialId; }
    public void setEditorialId(Long editorialId) { this.editorialId = editorialId; }

    public Long getGenreId() { return genreId; }
    public void setGenreId(Long genreId) { this.genreId = genreId; }

    public Long getTypeId() { return typeId; }
    public void setTypeId(Long typeId) { this.typeId = typeId; }
}
