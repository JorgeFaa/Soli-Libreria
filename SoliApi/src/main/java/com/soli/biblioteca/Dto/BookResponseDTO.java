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
    private String pdfUrl;
    private String epubUrl;
    private String coverUrl;

    private TextTypeResponseDTO type;
    private Set<AuthorResponseDTO> authors;
    private Set<EditorialResponseDTO> editorials;
    private Set<GenreResponseDTO> genres;
}
