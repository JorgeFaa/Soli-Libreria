package com.soli.biblioteca.mapper;

import com.soli.biblioteca.Dto.TextTypeResponseDTO;
import com.soli.biblioteca.model.TextType;

public class TextTypeMapper {

    public static TextTypeResponseDTO toResponseDTO(TextType textType) {
        if (textType == null) return null;

        return new TextTypeResponseDTO(
                textType.getId(),
                textType.getType()
        );
    }
}
