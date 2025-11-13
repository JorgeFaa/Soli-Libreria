package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TextTypeCreateDTO {
    @NotBlank(message = "El tipo de texto no puede estar vacío")
    @Size(max = 100)
    private String type;
}
