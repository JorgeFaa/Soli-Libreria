package com.soli.biblioteca.Dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

@Data
public class BookUpdateDTO {
    private Optional<String> title = Optional.empty();
    private Optional<String> description = Optional.empty();
    private Optional<LocalDate> publishedDate = Optional.empty();
    private Optional<String> textUrl = Optional.empty();
    private Optional<String> coverUrl = Optional.empty();
    private Optional<Set<Long>> authorIds = Optional.empty();
    private Optional<Set<Long>> editorialIds = Optional.empty();
    private Optional<Set<Long>> genreIds = Optional.empty();
    private Optional<Long> typeId = Optional.empty();
}
