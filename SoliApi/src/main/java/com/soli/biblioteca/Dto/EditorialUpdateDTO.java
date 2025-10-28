package com.soli.biblioteca.Dto;

import lombok.Data;

import java.util.Optional;

@Data
public class EditorialUpdateDTO {
    private Optional<String> companyName = Optional.empty();
    private Optional<Long> countryId = Optional.empty();
}
