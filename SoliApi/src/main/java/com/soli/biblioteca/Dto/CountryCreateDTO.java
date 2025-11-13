package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CountryCreateDTO {
    @NotBlank(message = "El nombre del país no puede estar vacío")
    @Size(max = 100)
    private String countryname;
}
