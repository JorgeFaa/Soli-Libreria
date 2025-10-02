package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.CountryCreateDTO;
import com.soli.biblioteca.Dto.CountryResponseDTO;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.service.CountryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    private final CountryService countryService;

    public CountryController(CountryService countryService) {
        this.countryService = countryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CountryResponseDTO> create(@Valid @RequestBody CountryCreateDTO dto) {
        Country country = new Country();
        country.setName(dto.getName());
        Country saved = countryService.save(country);

        CountryResponseDTO response = new CountryResponseDTO(saved.getId(), saved.getName());

        URI location = URI.create("/api/countries/" + saved.getId());
        return ResponseEntity.created(location).body(response);    }

    @GetMapping
    public List<CountryResponseDTO> getAll() { return countryService.findAll()
            .stream()
            .map(c -> new CountryResponseDTO(c.getId(), c.getName()))
            .collect(Collectors.toList()); }

    @GetMapping("/{id}")
    public ResponseEntity<CountryResponseDTO> getById(@PathVariable Long id) {
        return countryService.findById(id)
                .map(c -> ResponseEntity.ok(new CountryResponseDTO(c.getId(), c.getName())))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Country not found"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (countryService.findById(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Country not found");
        }
        countryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

