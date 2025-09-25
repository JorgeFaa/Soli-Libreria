package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthorCreateDTO {
    // Getters y Setters
    private String name;
    private String middleName;
    private String lastName;
    private Long countryID;

}
