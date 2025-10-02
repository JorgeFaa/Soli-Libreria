package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserDTO {
    // Getters y Setters
    private Long id;
    private String firstName;
    private String lastName;
    private boolean activeMember;
    private String genrePreference;
    private String roleName;

}