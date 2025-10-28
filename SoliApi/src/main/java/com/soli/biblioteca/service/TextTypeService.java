package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.TextTypeUpdateDTO;
import com.soli.biblioteca.model.TextType;
import com.soli.biblioteca.repository.TextTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TextTypeService {

    private final TextTypeRepository textTypeRepository;

    public TextTypeService(TextTypeRepository textTypeRepository) {
        this.textTypeRepository = textTypeRepository;
    }

    public List<TextType> getAllTextTypes() {
        return textTypeRepository.findAll();
    }

    public Optional<TextType> getTextTypeById(Long id) {
        return textTypeRepository.findById(id);
    }

    public TextType createTextType(TextType textType) {
        return textTypeRepository.save(textType);
    }

    public TextType updateTextType(Long id, TextTypeUpdateDTO textTypeDetails) {
        TextType textType = textTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de texto no encontrado con id: " + id));
        textTypeDetails.getType().ifPresent(textType::setType);
        return textTypeRepository.save(textType);
    }

    public void deleteTextType(Long id) {
        textTypeRepository.deleteById(id);
    }
}
