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
@Table(name = "texts", schema = "public")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "textid")
    private Long id;

    @Column(name = "texttitle")
    private String title;

    @Column(name = "descripcion")
    private String description;

    @Column(name = "publisheddate")
    private LocalDate publishedDate;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "epub_url")
    private String epubUrl;

    @Column(name = "coverurl")
    private String coverUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "typeid")
    private TextType type;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "text_authors",
            joinColumns = @JoinColumn(name = "textid"),
            inverseJoinColumns = @JoinColumn(name = "authorid")
    )
    @JsonIgnoreProperties("books")
    private Set<Author> authors = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "text_editorials",
            joinColumns = @JoinColumn(name = "textid"),
            inverseJoinColumns = @JoinColumn(name = "editorialid")
    )
    @JsonIgnoreProperties("books")
    private Set<Editorial> editorials = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "text_genres",
            joinColumns = @JoinColumn(name = "textid"),
            inverseJoinColumns = @JoinColumn(name = "genreid")
    )
    @JsonIgnoreProperties("books")
    private Set<Genre> genres = new HashSet<>();

    @ManyToMany(mappedBy = "favoriteBooks")
    @JsonIgnoreProperties("favoriteBooks")
    private Set<User> favoritedByUsers = new HashSet<>();
}
