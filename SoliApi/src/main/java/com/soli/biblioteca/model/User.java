package com.soli.biblioteca.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@Entity
@Table(name = "users", schema = "public")
public class User {
    // Getters y Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid")
    private Long id;

    @Column(name = "cognitosub", unique = true, nullable = false)
    private String cognitoSub; // UUID de Cognito

    @Column(name = "firstname", nullable = false)
    private String firstName;

    @Column(name = "lastname", nullable = false)
    private String lastName;

    @Column(name = "activemember", nullable = false)
    private boolean activeMember;

    @ManyToMany
    @JoinTable(
            name = "user_genres",
            joinColumns = @JoinColumn(name = "userid"),
            inverseJoinColumns = @JoinColumn(name = "genreid")
    )
    private Set<Genre> preferredGenres = new HashSet<>();


}