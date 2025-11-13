package com.soli.biblioteca.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja nuestras excepciones de lógica de negocio personalizadas.
     * Devuelve el código de estado especificado en la excepción (o 400 por defecto).
     */
    @ExceptionHandler(BusinessLogicException.class)
    public ResponseEntity<Map<String, String>> handleBusinessLogicException(BusinessLogicException ex) {
        return new ResponseEntity<>(Map.of("error", ex.getMessage()), ex.getStatus());
    }

    /**
     * Maneja los errores de validación de los DTOs (anotaciones como @NotNull, @Size, etc.).
     * Devuelve un 400 Bad Request con un mapa de los campos que fallaron y sus mensajes.
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    /**
     * Un manejador "catch-all" para cualquier otra excepción no esperada.
     * Devuelve un 500 Internal Server Error para evitar exponer detalles internos.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        // Loggear la excepción completa para depuración interna
        // log.error("Unhandled exception occurred", ex); 
        return new ResponseEntity<>(Map.of("error", "Ocurrió un error interno en el servidor."), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
