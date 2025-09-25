package com.soli.biblioteca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@Entity
@Table(name = "genres", schema = "public")
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "genreid")
    private Long id;

    @Column(name = "genrename")
    private String name;

    @ManyToMany(mappedBy = "genres")
    @JsonIgnoreProperties("genres") // evita recursión infinita al serializar JSON
    private Set<Book> books = new HashSet<>();
}
