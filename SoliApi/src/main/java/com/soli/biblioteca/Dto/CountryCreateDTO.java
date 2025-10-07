package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CountryCreateDTO {
    // getters y setters
    @NotBlank
    private String name;

}
