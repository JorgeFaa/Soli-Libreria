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
    private boolean activeMember;
    private Set<Long> prefferedGenreIds;
    private String roleName;

}