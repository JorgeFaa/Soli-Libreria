package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserCreateDTO {
    private String firstName;
    private String lastName;
    private boolean activeMember;
    private String genrePreference;
    private String roleName; // Nuevo campo para el sub de Cognito

    // Getters y Setters

}