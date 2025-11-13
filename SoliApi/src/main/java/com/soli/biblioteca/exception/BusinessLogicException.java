package com.soli.biblioteca.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessLogicException extends RuntimeException {

    private final HttpStatus status;

    public BusinessLogicException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST; // 400 por defecto
    }

    public BusinessLogicException(String message, int httpStatusCode) {
        super(message);
        this.status = HttpStatus.valueOf(httpStatusCode);
    }
}
