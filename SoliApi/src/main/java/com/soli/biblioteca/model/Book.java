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

    // Declarar explicitamente como TEXT para evitar mapeo por defecto a varchar(255)
    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "publisheddate") // minúscula
    private LocalDate publishedDate;

    // URLs largas como pre-signed S3 pueden exceder 255; elevamos a 1024
    @Column(name = "texturl", nullable = false, length = 1024)
    private String textUrl;

    @Column(name = "coverurl", nullable = false, length = 1024)
    private String coverUrl;

    // --------- Relaciones ---------

    @ManyToMany
    @JoinTable(
            name = "text_authors",
            joinColumns = @JoinColumn(name = "textid"),
            inverseJoinColumns = @JoinColumn(name = "authorid")
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
            joinColumns = @JoinColumn(name = "textid"),
            inverseJoinColumns = @JoinColumn(name = "genreid")
    )
    @JsonIgnoreProperties("genres")
    private Set<Genre> genres = new HashSet<>();

    @ManyToMany(mappedBy = "favoriteBooks")
    @JsonIgnoreProperties("favoriteBooks")
    private Set<User> usersWhoFavorited = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "typeid", nullable = false) // minúscula
    private TextType type;

}
