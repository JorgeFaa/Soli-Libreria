package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.CountryResponseDTO;
import com.soli.biblioteca.model.Country;

public class CountryMapper {

    public static CountryResponseDTO toResponseDTO(Country country) {
        if (country == null) return null;

        return new CountryResponseDTO(
                country.getId(),
                country.getName()
        );
    }
}
