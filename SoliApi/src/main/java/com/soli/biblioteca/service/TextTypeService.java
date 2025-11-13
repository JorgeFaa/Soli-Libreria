package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.TextTypeCreateDTO;
import com.soli.biblioteca.Dto.TextTypeResponseDTO;
import com.soli.biblioteca.Dto.TextTypeUpdateDTO;
import com.soli.biblioteca.exception.ResourceNotFoundException;
import com.soli.biblioteca.mapper.TextTypeMapper;
import com.soli.biblioteca.model.TextType;
import com.soli.biblioteca.repository.TextTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TextTypeService {

    private final TextTypeRepository textTypeRepository;

    public TextTypeService(TextTypeRepository textTypeRepository) {
        this.textTypeRepository = textTypeRepository;
    }

    public List<TextTypeResponseDTO> getAllTextTypes() {
        return textTypeRepository.findAll().stream()
                .map(TextTypeMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<TextTypeResponseDTO> getTextTypeById(Long id) {
        return textTypeRepository.findById(id).map(TextTypeMapper::toResponseDTO);
    }

    public TextTypeResponseDTO createTextType(TextTypeCreateDTO dto) {
        TextType textType = new TextType();
        textType.setType(dto.getType());
        TextType savedTextType = textTypeRepository.save(textType);
        return TextTypeMapper.toResponseDTO(savedTextType);
    }

    public TextTypeResponseDTO updateTextType(Long id, TextTypeUpdateDTO textTypeDetails) {
        TextType textType = textTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de texto", id));
        textTypeDetails.getType().ifPresent(textType::setType);
        TextType updatedTextType = textTypeRepository.save(textType);
        return TextTypeMapper.toResponseDTO(updatedTextType);
    }

    public void deleteTextType(Long id) {
        if (!textTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tipo de texto", id);
        }
        textTypeRepository.deleteById(id);
    }
}
