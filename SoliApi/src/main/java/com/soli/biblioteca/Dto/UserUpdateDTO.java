package com.soli.biblioteca.Dto;

import lombok.Data;

import java.util.Optional;
import java.util.Set;

@Data
public class UserUpdateDTO {
    private Optional<String> firstName = Optional.empty();
    private Optional<String> lastName = Optional.empty();
    private Optional<Set<Long>> preferredGenreIds = Optional.empty();
}
