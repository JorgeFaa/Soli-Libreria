package com.soli.biblioteca.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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

    @Column(name = "publisheddate") // minúscula
    private LocalDate publishedDate;

    // --------- Relaciones ---------

    @ManyToOne
    @JoinColumn(name = "authors") // minúscula
    private Author author;

    @ManyToOne
    @JoinColumn(name = "editorials") // minúscula
    private Editorial editorial;

    @ManyToOne
    @JoinColumn(name = "genres") // minúscula
    private Genre genre;

    @ManyToOne
    @JoinColumn(name = "texttype") // minúscula
    private TextType type;

    // --------- Getters y Setters ---------

}