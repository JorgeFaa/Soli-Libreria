package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Setter
@Getter
public class BookCreateDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private LocalDate publishedDate;

    @NotBlank
    private String textUrl;

    @NotBlank
    private String coverUrl;

    // Foreign Keys
    @NotNull
    private Set<Long> authorIds;

    @NotNull
    private Set<Long> editorialIds;

    @NotNull
    private Set<Long> genreIds;

    @NotNull
    private Long typeId;


}
