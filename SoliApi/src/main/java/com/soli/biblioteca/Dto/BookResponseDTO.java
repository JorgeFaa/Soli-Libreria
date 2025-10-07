package com.soli.biblioteca.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BookResponseDTO {

    private Long id;
    private String title;
    private String description;
    private LocalDate publishedDate;
    private String textUrl;
    private String coverUrl;

    // Foreign Keys
    private Set<Long> authorIds;
    private Set<Long> editorialIds;
    private Set<Long> genreIds;
    private Long typeId;

}
