package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class BookFilterDTO {
    
    // Búsqueda general
    private String search; // Busca en título y descripción
    
    // Filtros específicos
    private String title;
    private String authorName;
    private Set<Long> genreIds;
    private Set<Long> editorialIds;
    private Long typeId;
    
    // Filtros de fecha
    private LocalDate publishedAfter;
    private LocalDate publishedBefore;
    
    // Paginación
    @Min(value = 0, message = "La página debe ser mayor o igual a 0")
    private Integer page = 0;
    
    @Min(value = 1, message = "El tamaño de página debe ser al menos 1")
    @Max(value = 100, message = "El tamaño de página no puede ser mayor a 100")
    private Integer size = 20;
    
    // Ordenamiento
    private String sortBy = "title"; // title, publishedDate, id
    private String sortDirection = "ASC"; // ASC, DESC
    
    public String getSortDirection() {
        return sortDirection != null && sortDirection.equalsIgnoreCase("DESC") ? "DESC" : "ASC";
    }
    
    public String getSortBy() {
        Set<String> validSortFields = Set.of("title", "publishedDate", "id");
        return validSortFields.contains(sortBy) ? sortBy : "title";
    }
}