package com.soli.biblioteca.service;

import com.soli.biblioteca.model.Editorial;
import com.soli.biblioteca.repository.EditorialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EditorialService {
    private final EditorialRepository editorialRepository;

    public EditorialService(EditorialRepository editorialRepository) {
        this.editorialRepository = editorialRepository;
    }

    public Editorial save(Editorial editorial) { return editorialRepository.save(editorial); }

    public List<Editorial> findAll() { return editorialRepository.findAll(); }

    public Optional<Editorial> findById(Long id) { return editorialRepository.findById(id); }

    public void delete(Long id) { editorialRepository.deleteById(id); }
}

