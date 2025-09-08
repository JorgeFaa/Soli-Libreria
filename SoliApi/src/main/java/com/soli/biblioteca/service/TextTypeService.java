package com.soli.biblioteca.service;

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

    public TextType save(TextType textType) { return textTypeRepository.save(textType); }

    public List<TextType> findAll() { return textTypeRepository.findAll(); }

    public Optional<TextType> findById(Long id) { return textTypeRepository.findById(id); }

    public void delete(Long id) { textTypeRepository.deleteById(id); }
}
