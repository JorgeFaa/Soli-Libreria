package com.soli.biblioteca.Dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class BookCreateDTO {

    private String title;
    private LocalDate publishedDate;

    private Long authorId;
    private Long editorialId;
    private Long genreId;
    private Long typeId;


}
