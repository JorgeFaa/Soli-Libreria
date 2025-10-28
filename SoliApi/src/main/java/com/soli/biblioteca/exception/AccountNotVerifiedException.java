package com.soli.biblioteca.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccountNotVerifiedException extends RuntimeException {
    private final String nextStep;

    public AccountNotVerifiedException(String message, String nextStep) {
        super(message);
        this.nextStep = nextStep;
    }

    public String getNextStep() {
        return nextStep;
    }
}
