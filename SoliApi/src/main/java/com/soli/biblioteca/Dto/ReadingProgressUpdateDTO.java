package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReadingProgressUpdateDTO {

    @NotNull
    @Min(1)
    private Integer lastPage;
}
