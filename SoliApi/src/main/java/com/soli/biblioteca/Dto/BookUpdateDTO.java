package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Setter
@Getter
public class BookUpdateDTO {

    private String title;
    private String description;
    private LocalDate publishedDate;
    private String textUrl;
    private String coverUrl;

    // Foreign Keys - Optional para permitir actualización parcial
    private Set<Long> authorIds;
    private Set<Long> editorialIds;
    private Set<Long> genreIds;
    private Long typeId;

}