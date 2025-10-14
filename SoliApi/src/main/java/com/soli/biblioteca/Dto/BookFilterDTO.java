package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookFilterDTO {
    
    // Búsqueda general
    private String search; // Busca en título y descripción
    
    // Filtros específicos
    private String title;
    private String authorName;
    private List<Long> genreIds;
    private List<Long> editorialIds;
    private Long typeId;
    
    // Filtros de fecha
    private LocalDate publishedAfter;
    private LocalDate publishedBefore;
    
    // Paginación
    @Min(value = 0, message = "La página debe ser mayor o igual a 0")
    @Builder.Default
    private Integer page = 0;
    
    @Min(value = 1, message = "El tamaño de página debe ser al menos 1")
    @Max(value = 100, message = "El tamaño de página no puede ser mayor a 100")
    @Builder.Default
    private Integer size = 20;
    
    // Ordenamiento
    @Builder.Default
    private String sortBy = "title"; // title, publishedDate, id
    @Builder.Default
    private String sortDirection = "ASC"; // ASC, DESC
    
    public String getSortDirection() {
        return sortDirection != null && sortDirection.equalsIgnoreCase("DESC") ? "DESC" : "ASC";
    }
    
    public String getSortBy() {
        // Campos válidos para ordenar basados en la entidad Book
        Set<String> validSortFields = Set.of("title", "publishedDate", "id");
        return validSortFields.contains(sortBy) ? sortBy : "title";
    }
}