package com.soli.biblioteca.Dto;

import lombok.Data;

import java.util.Optional;

@Data
public class AuthorUpdateDTO {
    private Optional<String> name = Optional.empty();
    private Optional<String> middleName = Optional.empty();
    private Optional<String> lastName = Optional.empty();
    private Optional<Long> countryId = Optional.empty();
}
