package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.CountryDTO;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.service.CountryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    private final CountryService countryService;

    public CountryController(CountryService countryService) {
        this.countryService = countryService;
    }

    @PostMapping
    public ResponseEntity<Country> create(@RequestBody CountryDTO dto) {
        Country country = new Country();
        country.setName(dto.getName());
        return ResponseEntity.ok(countryService.save(country));
    }

    @GetMapping
    public List<Country> getAll() { return countryService.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Country> getById(@PathVariable Long id) {
        return countryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        countryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

