package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.EditorialCreateDTO;
import com.soli.biblioteca.Dto.EditorialUpdateDTO;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.model.Editorial;
import com.soli.biblioteca.repository.CountryRepository;
import com.soli.biblioteca.repository.EditorialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EditorialService {

    private final EditorialRepository editorialRepository;
    private final CountryRepository countryRepository;

    public EditorialService(EditorialRepository editorialRepository, CountryRepository countryRepository) {
        this.editorialRepository = editorialRepository;
        this.countryRepository = countryRepository;
    }

    public List<Editorial> getAllEditorials() {
        return editorialRepository.findAll();
    }

    public Optional<Editorial> getEditorialById(Long id) {
        return editorialRepository.findById(id);
    }

    @Transactional
    public Editorial createEditorial(EditorialCreateDTO editorialDTO) {
        Country country = countryRepository.findById(editorialDTO.getCountryId())
                .orElseThrow(() -> new RuntimeException("País no encontrado con id: " + editorialDTO.getCountryId()));

        Editorial editorial = new Editorial();
        editorial.setCompanyName(editorialDTO.getCompanyName());
        editorial.setCountry(country);

        return editorialRepository.save(editorial);
    }

    @Transactional
    public Editorial updateEditorial(Long id, EditorialUpdateDTO editorialDTO) {
        Editorial editorial = editorialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Editorial no encontrada con id: " + id));

        editorialDTO.getCompanyName().ifPresent(editorial::setCompanyName);
        editorialDTO.getCountryId().ifPresent(countryId -> {
            Country country = countryRepository.findById(countryId)
                    .orElseThrow(() -> new RuntimeException("País no encontrado con id: " + countryId));
            editorial.setCountry(country);
        });

        return editorialRepository.save(editorial);
    }

    public void deleteEditorial(Long id) {
        editorialRepository.deleteById(id);
    }
}
