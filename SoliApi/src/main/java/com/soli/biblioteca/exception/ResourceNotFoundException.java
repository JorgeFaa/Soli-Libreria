package com.soli.biblioteca.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessLogicException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s no encontrado con id: %d", resourceName, id), HttpStatus.NOT_FOUND.value());
    }

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND.value());
    }
}
