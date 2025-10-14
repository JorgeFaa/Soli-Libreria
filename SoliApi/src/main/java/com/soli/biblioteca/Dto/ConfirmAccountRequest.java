package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ConfirmAccountRequest {
    @NotBlank(message = "El username es requerido")
    @Email(message = "El formato del email no es válido")
    private String username;
    
    @NotBlank(message = "El código de verificación es requerido")
    @Pattern(regexp = "^\\d{6}$", message = "El código debe tener exactamente 6 dígitos")
    private String code;

}
