package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ConfirmAccountRequest {
    // getters y setters
    private String username;
    private String code;

}