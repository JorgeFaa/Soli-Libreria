package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDate;
import java.util.Set;

@Data
public class BookCreateDTO {

    @NotBlank
    @Size(max = 250)
    private String title;

    @NotBlank
    private String description;

    private LocalDate publishedDate;

    @URL
    private String pdfUrl;

    @URL
    private String epubUrl;

    @NotBlank
    @URL
    private String coverUrl;

    @NotNull
    private Long typeId;

    @NotEmpty
    private Set<Long> authorIds;

    @NotEmpty
    private Set<Long> editorialIds;

    @NotEmpty
    private Set<Long> genreIds;
}
