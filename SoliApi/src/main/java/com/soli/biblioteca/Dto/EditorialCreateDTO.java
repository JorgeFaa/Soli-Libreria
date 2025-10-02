package com.soli.biblioteca.Dto;

import com.soli.biblioteca.model.Country;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class EditorialCreateDTO {
    private String companyName;
    private Long countryID;

}
