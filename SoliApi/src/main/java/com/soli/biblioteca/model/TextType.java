package com.soli.biblioteca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "texttype", schema = "public")
public class TextType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "typeid")
    private Long id;

    @Column(name = "texttype")
    private String type;

    @OneToMany(mappedBy = "type")
    @JsonIgnoreProperties("type")
    private Set<Book> books = new HashSet<>();
}
