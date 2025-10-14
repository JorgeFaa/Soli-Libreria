package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class VerificationRequest {
    @NotBlank(message = "El username es requerido")
    @Email(message = "El formato del email no es válido")
    private String username;

}


