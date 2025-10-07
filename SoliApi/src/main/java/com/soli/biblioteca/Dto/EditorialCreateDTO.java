package com.soli.biblioteca.Dto;

import com.soli.biblioteca.model.Country;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class EditorialCreateDTO {
    @NotBlank
    private String companyName;
    @NotNull
    private Long countryID;

}
