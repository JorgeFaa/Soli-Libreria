package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterDTO {
    @NotBlank
    private String username;
    @NotBlank
    private String password;

    // Getters y Setters

}
