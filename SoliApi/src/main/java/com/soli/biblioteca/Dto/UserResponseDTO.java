package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UserResponseDTO {

    private Long id; // ID interno de usuario
    private String firstName;
    private String lastName;
    private String email; // Email del usuario
    private Set<Long> preferredGenreIds;
    private Set<Long> favoriteBooks;

}
