package com.soli.biblioteca.Dto;

import lombok.Data;

import java.util.Optional;

@Data
public class CountryUpdateDTO {
    private Optional<String> countryname = Optional.empty();
}
