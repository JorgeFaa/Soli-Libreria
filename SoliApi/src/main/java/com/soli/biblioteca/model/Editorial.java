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
@Table(name = "editorials", schema = "public")
public class Editorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "editorialid")
    private Long id;


    @Column(name = "companyname", nullable = false, length = 250)
    private String companyName;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "countryid")
    private Country country;

    @OneToMany(mappedBy = "editorial")
    @JsonIgnoreProperties("editorial") // evita loops infinitos al serializar JSON
    private Set<Book> books = new HashSet<>();
}
