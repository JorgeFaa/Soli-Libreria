package com.soli.biblioteca.service;

import com.soli.biblioteca.Dto.CountryCreateDTO;
import com.soli.biblioteca.Dto.CountryResponseDTO;
import com.soli.biblioteca.Dto.CountryUpdateDTO;
import com.soli.biblioteca.exception.ResourceNotFoundException;
import com.soli.biblioteca.mapper.CountryMapper;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.repository.CountryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CountryService {

    private final CountryRepository countryRepository;

    public CountryService(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    public List<CountryResponseDTO> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(CountryMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<CountryResponseDTO> getCountryById(Long id) {
        return countryRepository.findById(id).map(CountryMapper::toResponseDTO);
    }

    public CountryResponseDTO createCountry(CountryCreateDTO dto) {
        Country country = new Country();
        country.setName(dto.getCountryname());
        Country savedCountry = countryRepository.save(country);
        return CountryMapper.toResponseDTO(savedCountry);
    }

    public CountryResponseDTO updateCountry(Long id, CountryUpdateDTO countryDetails) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("País", id));
        countryDetails.getCountryname().ifPresent(country::setName);
        Country updatedCountry = countryRepository.save(country);
        return CountryMapper.toResponseDTO(updatedCountry);
    }

    public void deleteCountry(Long id) {
        if (!countryRepository.existsById(id)) {
            throw new ResourceNotFoundException("País", id);
        }
        countryRepository.deleteById(id);
    }
}
