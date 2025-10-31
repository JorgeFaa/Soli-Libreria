package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.EditorialResponseDTO;
import com.soli.biblioteca.model.Editorial;

public class EditorialMapper {

    public static EditorialResponseDTO toResponseDTO(Editorial editorial) {
        if (editorial == null) return null;

        return new EditorialResponseDTO(
                editorial.getId(),
                editorial.getCompanyName(),
                editorial.getCountry() != null ? editorial.getCountry().getId() : null,
                editorial.getCountry() != null ? editorial.getCountry().getName() : null
        );
    }
}
