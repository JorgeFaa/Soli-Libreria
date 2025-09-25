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
@Table(name = "country", schema = "public")
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "countryid")
    private Long id;

    @Column(name = "countryname")
    private String name;

    @OneToMany(mappedBy = "country")
    @JsonIgnoreProperties("country") // evita loops infinitos al serializar JSON
    private Set<Author> authors = new HashSet<>();

    // Relación inversa con editoriales
    @OneToMany(mappedBy = "country")
    @JsonIgnoreProperties("country") // evita loops infinitos al serializar JSON
    private Set<Editorial> editorials = new HashSet<>();
}
