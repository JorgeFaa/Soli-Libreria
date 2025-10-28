package com.soli.biblioteca.Dto;

import lombok.Data;

import java.util.Optional;

@Data
public class GenreUpdateDTO {
    private Optional<String> genrename = Optional.empty();
}
