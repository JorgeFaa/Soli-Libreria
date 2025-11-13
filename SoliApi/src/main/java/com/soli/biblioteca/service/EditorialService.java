package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.EditorialCreateDTO;
import com.soli.biblioteca.Dto.EditorialResponseDTO;
import com.soli.biblioteca.Dto.EditorialUpdateDTO;
import com.soli.biblioteca.exception.ResourceNotFoundException;
import com.soli.biblioteca.mapper.EditorialMapper;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.model.Editorial;
import com.soli.biblioteca.repository.CountryRepository;
import com.soli.biblioteca.repository.EditorialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EditorialService {

    private final EditorialRepository editorialRepository;
    private final CountryRepository countryRepository;

    public EditorialService(EditorialRepository editorialRepository, CountryRepository countryRepository) {
        this.editorialRepository = editorialRepository;
        this.countryRepository = countryRepository;
    }

    public List<EditorialResponseDTO> getAllEditorials() {
        return editorialRepository.findAll().stream()
                .map(EditorialMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<EditorialResponseDTO> getEditorialById(Long id) {
        return editorialRepository.findById(id).map(EditorialMapper::toResponseDTO);
    }

    @Transactional
    public EditorialResponseDTO createEditorial(EditorialCreateDTO editorialDTO) {
        Country country = countryRepository.findById(editorialDTO.getCountryId())
                .orElseThrow(() -> new ResourceNotFoundException("País", editorialDTO.getCountryId()));

        Editorial editorial = new Editorial();
        editorial.setCompanyName(editorialDTO.getCompanyName());
        editorial.setCountry(country);

        Editorial savedEditorial = editorialRepository.save(editorial);
        return EditorialMapper.toResponseDTO(savedEditorial);
    }

    @Transactional
    public EditorialResponseDTO updateEditorial(Long id, EditorialUpdateDTO editorialDTO) {
        Editorial editorial = editorialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Editorial", id));

        editorialDTO.getCompanyName().ifPresent(editorial::setCompanyName);
        editorialDTO.getCountryId().ifPresent(countryId -> {
            Country country = countryRepository.findById(countryId)
                    .orElseThrow(() -> new ResourceNotFoundException("País", countryId));
            editorial.setCountry(country);
        });

        Editorial updatedEditorial = editorialRepository.save(editorial);
        return EditorialMapper.toResponseDTO(updatedEditorial);
    }

    public void deleteEditorial(Long id) {
        if (!editorialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Editorial", id);
        }
        editorialRepository.deleteById(id);
    }
}
