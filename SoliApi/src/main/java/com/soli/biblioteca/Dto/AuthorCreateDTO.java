package com.soli.biblioteca.Dto;

import lombok.Data;

@Data
public class AuthorCreateDTO {
    private String name;
    private String middleName;
    private String lastName;
    private Long countryId;
}
