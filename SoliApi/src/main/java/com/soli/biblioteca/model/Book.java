package com.soli.biblioteca.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "texts", schema = "public") // Postgres lo guarda en minúsculas
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "textid") // minúscula
    private Long id;

    @Column(name = "texttitle", nullable = false, length = 250) // minúscula
    private String title;

    @Column(name = "publisheddate") // minúscula
    private LocalDate publishedDate;

    // --------- Relaciones ---------

    @ManyToOne
    @JoinColumn(name = "authorid") // minúscula
    private Author author;

    @ManyToOne
    @JoinColumn(name = "editorialid") // minúscula
    private Editorial editorial;

    @ManyToOne
    @JoinColumn(name = "genreid") // minúscula
    private Genre genre;

    @ManyToOne
    @JoinColumn(name = "typeid") // minúscula
    private TextType type;

    // --------- Getters y Setters ---------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getPublishedDate() {
        return publishedDate;
    }

    public void setPublishedDate(LocalDate publishedDate) {
        this.publishedDate = publishedDate;
    }

    public Author getAuthor() {
        return author;
    }

    public void setAuthor(Author author) {
        this.author = author;
    }

    public Editorial getEditorial() {
        return editorial;
    }

    public void setEditorial(Editorial editorial) {
        this.editorial = editorial;
    }

    public Genre getGenre() {
        return genre;
    }

    public void setGenre(Genre genre) {
        this.genre = genre;
    }

    public TextType getType() {
        return type;
    }

    public void setType(TextType type) {
        this.type = type;
    }
}