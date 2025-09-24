package com.soli.biblioteca.Dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EditorialResponseDTO {
    private Long id;
    private String companyName;
    private Long countryId;
    private String countryName;
}
