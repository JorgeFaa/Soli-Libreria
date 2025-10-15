package com.soli.biblioteca.controller.v2;

import com.soli.biblioteca.Dto.EditorialCreateDTO;
import com.soli.biblioteca.Dto.EditorialResponseDTO;
import com.soli.biblioteca.model.Country;
import com.soli.biblioteca.model.Editorial;
import com.soli.biblioteca.service.CountryService;
import com.soli.biblioteca.service.EditorialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

import static com.soli.biblioteca.config.ApiVersioningConfig.API_V2_PREFIX;


@RestController
@RequestMapping(API_V2_PREFIX + "/editorials")
public class EditorialControllerV2 {

    private final EditorialService editorialService;
    private final CountryService countryService;

    public EditorialControllerV2(EditorialService editorialService, CountryService countryService) {
        this.editorialService = editorialService;
        this.countryService = countryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EditorialResponseDTO> create(@Valid @RequestBody EditorialCreateDTO dto) {
        if (editorialService.existsByCompanyName(dto.getCompanyName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Editorial already exists");
        }
        Country country = countryService.findById(dto.getCountryID())
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Country not found"));

        Editorial editorial = new Editorial();
        editorial.setCompanyName(dto.getCompanyName());
        editorial.setCountry(country);

        Editorial saved = editorialService.save(editorial);

        EditorialResponseDTO response = new EditorialResponseDTO(
                saved.getId(),
                saved.getCompanyName(),
                saved.getCountry().getId(),
                saved.getCountry().getName()
        );

URI location = URI.create("/editorials/" + saved.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<EditorialResponseDTO> getAll() {
        return editorialService.findAll()
                .stream()
                .map(e -> new EditorialResponseDTO(
                        e.getId(),
                        e.getCompanyName(),
                        e.getCountry().getId(),
                        e.getCountry().getName()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EditorialResponseDTO> getById(@PathVariable Long id) {
        return editorialService.findById(id)
                .map(e -> ResponseEntity.ok(new EditorialResponseDTO(
                        e.getId(),
                        e.getCompanyName(),
                        e.getCountry().getId(),
                        e.getCountry().getName()
                )))
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Editorial not found"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (editorialService.findById(id).isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Editorial not found");
        }
        editorialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
