package com.soli.biblioteca.service;


import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.repository.CountryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CountryService {
    private final CountryRepository countryRepository;

    public CountryService(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    public Country save(Country country) { return countryRepository.save(country); }

    public List<Country> findAll() { return countryRepository.findAll(); }

    public boolean existsByName(String name){ return countryRepository.existsByName(name); }

    public Optional<Country> findById(Long id) { return countryRepository.findById(id); }

    public void delete(Long id) { countryRepository.deleteById(id); }
}

