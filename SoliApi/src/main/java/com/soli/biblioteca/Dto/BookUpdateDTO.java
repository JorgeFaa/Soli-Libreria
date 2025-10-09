package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class BookUpdateDTO {
    private String title;               // null = no cambiar
    private String description;         // null = no cambiar
    private LocalDate publishedDate;    // null = no cambiar
    private String textUrl;             // null = no cambiar
    private String coverUrl;            // null = no cambiar

    // Si el set es null => no cambiar; si está presente (aunque vacío) => reemplazar por ese contenido
    private Set<Long> authorIds;
    private Set<Long> editorialIds;
    private Set<Long> genreIds;

    private Long typeId;                // null = no cambiar
}