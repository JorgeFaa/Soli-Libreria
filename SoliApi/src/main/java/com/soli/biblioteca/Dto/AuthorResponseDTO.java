package com.soli.biblioteca.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthorResponseDTO {
    private Long id;
    private String name;
    private String middleName;
    private String lastName;
    private String countryName;
}
