package com.soli.biblioteca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@Entity
@Table(name = "texts", schema = "public") // Postgres lo guarda en minúsculas
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "textid") // minúscula
    private Long id;

    @Column(name = "texttitle", nullable = false, length = 250) // minúscula
    private String title;

    @Column(name = "descripcion", nullable = false)
    private String description;

    @Column(name = "publisheddate") // minúscula
    private LocalDate publishedDate;

    @Column(name = "texturl")
    private String textUrl;

    @Column(name = "coverurl")
    private String coverUrl;

    // --------- Relaciones ---------

    @ManyToMany
    @JoinTable(
            name = "text_authors",
            joinColumns = @JoinColumn(name = "textID"),
            inverseJoinColumns = @JoinColumn(name = "authorID")
    )
    @JsonIgnoreProperties("books")
    private Set<Author> authors = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "text_editorials",
            joinColumns = @JoinColumn(name = "textid"),
            inverseJoinColumns = @JoinColumn(name = "editorialid")
    )
    @JsonIgnoreProperties("editorials")
    private Set<Editorial> editorials = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "text_genres",
            joinColumns = @JoinColumn(name = "textID"),
            inverseJoinColumns = @JoinColumn(name = "genreID")
    )
    @JsonIgnoreProperties("genres")
    private Set<Genre> genres = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "typeid") // minúscula
    private TextType type;

}