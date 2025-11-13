package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenreCreateDTO {
    @NotBlank(message = "El nombre del género no puede estar vacío")
    @Size(max = 100)
    private String genrename;
}
