package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
public class UserDTO {
    // Getters y Setters
    private Long id;
    private String firstName;
    private String lastName;
    private Set<Long> prefferredGenreIds;
    private Set<Long> favoriteBooks;

}