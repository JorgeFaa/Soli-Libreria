package com.soli.biblioteca.model;

import jakarta.persistence.*;

@Entity
@Table(name = "genres", schema = "public")
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "genreid")
    private Long id;

    @Column(name = "genrename")
    private String name;

    // --------- Getters y Setters ---------

    public Long getGenreId() { return id; }
    public void setGenreId(Long id) { this.id = id; }

    public String getGenreName() { return name; }
    public void setGenreName(String name) { this.name = name; }
}
