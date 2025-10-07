package com.soli.biblioteca.controller;

import com.soli.biblioteca.Dto.TextTypeCreateDTO;
import com.soli.biblioteca.Dto.TextTypeResponseDTO;
import com.soli.biblioteca.Dto.TextTypeUpdateDTO;
import com.soli.biblioteca.model.TextType;
import com.soli.biblioteca.service.TextTypeService;
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
@RequestMapping("/api/types")
public class TextTypeController {

    private final TextTypeService textTypeService;

    public TextTypeController(TextTypeService textTypeService) {
        this.textTypeService = textTypeService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TextTypeResponseDTO> create(@Valid @RequestBody TextTypeCreateDTO dto) {
        if (textTypeService.existsByName(dto.getType())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "TextType already exists");
        }
        TextType type = new TextType();
        type.setType(dto.getType());
        TextType saved = textTypeService.save(type);

        TextTypeResponseDTO response = new TextTypeResponseDTO(saved.getId(), saved.getType());
        URI location = URI.create("/api/types/" + saved.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<TextTypeResponseDTO> getAll() {
        return textTypeService.findAll()
                .stream()
                .map(t -> new TextTypeResponseDTO(t.getId(), t.getType()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TextTypeResponseDTO> getById(@PathVariable Long id) {
        return textTypeService.findById(id)
                .map(t -> ResponseEntity.ok(new TextTypeResponseDTO(t.getId(), t.getType())))
                .orElseThrow(() -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "TextType not found"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (textTypeService.findById(id).isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "TextType not found");
        }
        textTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TextTypeResponseDTO> update(
            @PathVariable Long id,
            @RequestBody TextTypeUpdateDTO dto) {

        return textTypeService.findById(id)
                .map(existing -> {
                    // Solo actualizamos si el campo no es nulo y es diferente
                    if (dto.getType() != null && !dto.getType().equals(existing.getType())) {
                        existing.setType(dto.getType());
                    }

                    TextType saved = textTypeService.save(existing);

                    // Convertimos a ResponseDTO
                    TextTypeResponseDTO response = new TextTypeResponseDTO(saved.getId(), saved.getType());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
