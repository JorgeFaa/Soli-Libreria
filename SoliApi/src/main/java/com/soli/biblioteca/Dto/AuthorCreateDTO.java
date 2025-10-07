package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthorCreateDTO {
    // Getters y Setters
    @NotBlank
    private String name;

    private String middleName;

    private String lastName;

    @NotNull
    private Long countryID;

}
