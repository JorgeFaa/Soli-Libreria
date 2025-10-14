package com.soli.biblioteca.Dto;

import com.soli.biblioteca.model.Genre;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Setter
@Getter
public class UserCreateDTO {
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String firstName;
    
    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    private String lastName;
    
    // Cambiado: @NotBlank no es apropiado para boolean
    @NotNull(message = "El estado de membresía debe ser especificado")
    private Boolean activeMember;
    
    // Opcional: los géneros preferidos pueden ser nulos o vacíos
    private Set<Long> preferredGenreIds;

}
