package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Setter
@Getter
public class BookCreateDTO {

    @NotBlank(message = "El título es requerido")
    @Size(min = 1, max = 200, message = "El título debe tener entre 1 y 200 caracteres")
    private String title;

    @NotBlank(message = "La descripción es requerida")
    @Size(min = 10, max = 2000, message = "La descripción debe tener entre 10 y 2000 caracteres")
    private String description;

    @NotNull(message = "La fecha de publicación es requerida")
    private LocalDate publishedDate;

    @NotBlank(message = "La URL del texto es requerida")
    @Pattern(regexp = "^https?://.*", message = "La URL del texto debe ser válida")
    private String textUrl;

    @NotBlank(message = "La URL de la portada es requerida")
    @Pattern(regexp = "^https?://.*", message = "La URL de la portada debe ser válida")
    private String coverUrl;

    // Foreign Keys
    @NotNull(message = "Los autores son requeridos")
    @Size(min = 1, message = "Debe especificar al menos un autor")
    private Set<Long> authorIds;

    @NotNull(message = "Las editoriales son requeridas")
    @Size(min = 1, message = "Debe especificar al menos una editorial")
    private Set<Long> editorialIds;

    @NotNull(message = "Los géneros son requeridos")
    @Size(min = 1, message = "Debe especificar al menos un género")
    private Set<Long> genreIds;

    @NotNull(message = "El tipo de texto es requerido")
    private Long typeId;


}
