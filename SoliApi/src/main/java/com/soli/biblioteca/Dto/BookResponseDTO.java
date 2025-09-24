package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class BookResponseDTO {

    private Long id;
    private String title;
    private LocalDate publishedDate;
    private String textUrl;
    private String coverUrl;

    // Foreign Keys
    private Long authorId;
    private Long editorialId;
    private Long genreId;
    private Long typeId;

}
