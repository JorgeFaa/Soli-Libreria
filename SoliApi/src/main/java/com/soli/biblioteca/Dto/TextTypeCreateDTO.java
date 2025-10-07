package com.soli.biblioteca.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TextTypeCreateDTO {
    @NotBlank
    private String type;

}
