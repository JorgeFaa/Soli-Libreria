package com.soli.biblioteca.validation;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Validador personalizado para API V2
 * Contiene validaciones específicas y reglas de negocio para los endpoints V2
 */
@Component
public class ApiV2Validator {
    
    // Campos válidos para ordenamiento de libros
    private static final Set<String> VALID_BOOK_SORT_FIELDS = Set.of(
        "title", "publishedDate", "id", "createdAt"
    );
    
    // Campos válidos para ordenamiento de autores
    private static final Set<String> VALID_AUTHOR_SORT_FIELDS = Set.of(
        "name", "lastName", "id", "countryName"
    );
    
    // Direcciones válidas de ordenamiento
    private static final Set<String> VALID_SORT_DIRECTIONS = Set.of("ASC", "DESC");
    
    /**
     * Valida parámetros de paginación
     */
    public void validatePaginationParams(int page, int size) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "El número de página debe ser mayor o igual a 0");
        }
        
        if (size < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "El tamaño de página debe ser al menos 1");
        }
        
        if (size > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "El tamaño de página no puede ser mayor a 100");
        }
    }
    
    /**
     * Valida parámetros de ordenamiento para libros
     */
    public void validateBookSortParams(String sortBy, String sortDirection) {
        validateSortDirection(sortDirection);
        
        if (sortBy != null && !VALID_BOOK_SORT_FIELDS.contains(sortBy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                String.format("sortBy debe ser uno de: %s", String.join(", ", VALID_BOOK_SORT_FIELDS)));
        }
    }
    
    /**
     * Valida parámetros de ordenamiento para autores
     */
    public void validateAuthorSortParams(String sortBy, String sortDirection) {
        validateSortDirection(sortDirection);
        
        if (sortBy != null && !VALID_AUTHOR_SORT_FIELDS.contains(sortBy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                String.format("sortBy debe ser uno de: %s", String.join(", ", VALID_AUTHOR_SORT_FIELDS)));
        }
    }
    
    /**
     * Valida dirección de ordenamiento
     */
    private void validateSortDirection(String sortDirection) {
        if (sortDirection != null && !VALID_SORT_DIRECTIONS.contains(sortDirection.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "sortDirection debe ser ASC o DESC");
        }
    }
    
    /**
     * Valida rango de fechas
     */
    public void validateDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDate minValidDate = LocalDate.of(1000, 1, 1);
        LocalDate maxValidDate = LocalDate.now().plusYears(10);
        
        if (startDate != null) {
            if (startDate.isBefore(minValidDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "La fecha de inicio debe ser posterior al año 1000");
            }
            
            if (startDate.isAfter(maxValidDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "La fecha de inicio no puede ser más de 10 años en el futuro");
            }
        }
        
        if (endDate != null) {
            if (endDate.isBefore(minValidDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "La fecha de fin debe ser posterior al año 1000");
            }
            
            if (endDate.isAfter(maxValidDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "La fecha de fin no puede ser más de 10 años en el futuro");
            }
        }
        
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "La fecha de inicio no puede ser posterior a la fecha de fin");
        }
    }
    
    /**
     * Valida parámetros de texto
     */
    public void validateTextParam(String paramName, String value, int minLength, int maxLength) {
        if (value != null) {
            if (value.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    String.format("%s no puede estar vacío", paramName));
            }
            
            if (value.length() < minLength) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    String.format("%s debe tener al menos %d caracteres", paramName, minLength));
            }
            
            if (value.length() > maxLength) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    String.format("%s no puede tener más de %d caracteres", paramName, maxLength));
            }
        }
    }
    
    /**
     * Valida lista de IDs
     */
    public void validateIdList(String paramName, List<Long> ids) {
        if (ids != null) {
            if (ids.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    String.format("%s no puede estar vacío", paramName));
            }
            
            if (ids.size() > 50) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    String.format("%s no puede contener más de 50 elementos", paramName));
            }
            
            for (Long id : ids) {
                if (id == null || id <= 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                        String.format("Todos los IDs en %s deben ser números positivos", paramName));
                }
            }
        }
    }
    
    /**
     * Valida límites de resultados
     */
    public void validateResultLimit(int limit, int maxAllowed) {
        if (limit <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "El límite debe ser un número positivo");
        }
        
        if (limit > maxAllowed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                String.format("El límite no puede ser mayor a %d", maxAllowed));
        }
    }
    
    /**
     * Valida términos de búsqueda
     */
    public void validateSearchTerm(String searchTerm) {
        if (searchTerm != null) {
            if (searchTerm.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "El término de búsqueda no puede estar vacío");
            }
            
            if (searchTerm.length() < 2) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "El término de búsqueda debe tener al menos 2 caracteres");
            }
            
            if (searchTerm.length() > 200) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "El término de búsqueda no puede tener más de 200 caracteres");
            }
        }
    }
}